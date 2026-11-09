"""Génère une image ComfyUI pour chaque prompt de prompts-6-11.json.

Usage :
    python generate-image.py [prompts.json] [workflow_api.json] [out_dir]
    python generate-image.py --only FV-01 PPV-03     # ne générer que certains ids
    python generate-image.py --count 4               # nombre d'images par prompt (défaut 2)
    python generate-image.py --force                 # régénérer même si l'image existe

Bibliothèque standard uniquement.
"""
import argparse
import json
import random
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
SERVER = "http://127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())

DEFAULT_WORKFLOW = "cyberflux-gguf-test.json"  # Flux GGUF q4 (léger en VRAM/RAM)
TEXT_FIELDS = ("text", "t5xxl")  # CLIPTextEncode -> "text" ; CLIPTextEncodeFlux -> "t5xxl"

# Tailles par ratio (multiples de 16, ~0.9 Mpx)
SIZES = {"4:5": (832, 1040), "1:1": (1024, 1024), "3:4": (816, 1088), "9:16": (768, 1344)}


def http_json(url, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code} : {e.read().decode()}") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"ComfyUI injoignable sur {SERVER} : {e.reason}") from None


def run(workflow, out_dir, name):
    """Envoie le workflow, attend la fin, télécharge les images sous <name>.png."""
    prompt_id = http_json(f"{SERVER}/prompt", {"prompt": workflow, "client_id": CLIENT_ID})["prompt_id"]

    while True:  # /history/{id} reste vide tant que le job n'est pas terminé
        history = http_json(f"{SERVER}/history/{prompt_id}")
        if prompt_id in history:
            break
        time.sleep(0.5)

    entry = history[prompt_id]
    if entry["status"]["status_str"] != "success":
        errors = [m[1] for m in entry["status"]["messages"] if m[0] == "execution_error"]
        detail = (
            f"nœud {errors[0]['node_id']} ({errors[0]['node_type']}) : {errors[0]['exception_message'].splitlines()[0]}"
            if errors else entry["status"]
        )
        raise RuntimeError(f"Échec : {detail}")

    out_dir.mkdir(parents=True, exist_ok=True)
    saved = []
    for node_output in entry["outputs"].values():
        for img in node_output.get("images", []):
            qs = urllib.parse.urlencode(
                {"filename": img["filename"], "subfolder": img["subfolder"], "type": img["type"]}
            )
            with urllib.request.urlopen(f"{SERVER}/view?{qs}") as r:
                suffix = f"_{len(saved) + 1}" if saved else ""
                path = out_dir / f"{name}{suffix}{Path(img['filename']).suffix}"
                path.write_bytes(r.read())
                saved.append(path)
    return saved


def collect_entries(data):
    """Toutes les entrées ayant un champ 'prompt' (daily_gallery + weekly_ppv)."""
    return [img for section in ("daily_gallery", "weekly_ppv") for img in data.get(section, {}).get("images", [])]


def find_nodes(wf):
    """Retrouve (ksampler, positif, négatif, latent) en suivant les liens depuis le KSampler.

    Traverse les nœuds intermédiaires (ex. FluxGuidance) jusqu'à un nœud de texte.
    """
    def resolve_text_node(node_id):
        node = wf[node_id]
        while not any(f in node["inputs"] for f in TEXT_FIELDS):
            node_id = node["inputs"]["conditioning"][0]
            node = wf[node_id]
        return node

    ks = next(n for n in wf.values() if n["class_type"] in ("KSampler", "KSamplerAdvanced"))
    positive = resolve_text_node(ks["inputs"]["positive"][0])
    negative = resolve_text_node(ks["inputs"]["negative"][0])
    latent = wf[ks["inputs"]["latent_image"][0]]
    return ks, positive, negative, latent


def set_text(node, text):
    field = next(f for f in TEXT_FIELDS if f in node["inputs"])
    node["inputs"][field] = text


def build_workflow(template, entry, default_negative):
    wf = json.loads(json.dumps(template))  # copie profonde
    ks, positive, negative, latent = find_nodes(wf)

    set_text(positive, entry["prompt"])
    set_text(negative, entry.get("negative_prompt", default_negative))

    width, height = SIZES.get(entry.get("aspect_ratio", "4:5"), SIZES["4:5"])
    latent["inputs"].update(width=width, height=height, batch_size=1)

    ks["inputs"]["seed" if "seed" in ks["inputs"] else "noise_seed"] = random.randint(0, 2**48)
    for node in wf.values():
        if node["class_type"] == "SaveImage":
            node["inputs"]["filename_prefix"] = f"rosemily/{entry['id']}"
    return wf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompts", nargs="?", default=str(HERE / "prompts-6-11.json"))
    ap.add_argument("workflow", nargs="?", default=str(HERE / DEFAULT_WORKFLOW))
    ap.add_argument("out_dir", nargs="?", default=str(HERE / "outputs" / "rosemily"))
    ap.add_argument("--only", nargs="+", help="ids à générer (ex: FV-01 PPV-03)")
    ap.add_argument("--count", type=int, default=2, help="images par prompt (défaut 2, une à la fois)")
    ap.add_argument("--force", action="store_true", help="régénérer même si le fichier existe")
    args = ap.parse_args()

    data = json.loads(Path(args.prompts).read_text(encoding="utf-8"))
    template = json.loads(Path(args.workflow).read_text(encoding="utf-8"))
    out_dir = Path(args.out_dir)
    default_negative = data.get("common", {}).get("negative_prompt", "")

    entries = collect_entries(data)
    if args.only:
        entries = [e for e in entries if e["id"] in args.only]
    if not entries:
        raise SystemExit("Aucun prompt à générer.")

    try:
        http_json(f"{SERVER}/system_stats")  # vérifie tôt que le serveur répond
    except RuntimeError as e:
        raise SystemExit(str(e))

    ok = failed = skipped = 0
    for i, entry in enumerate(entries, 1):
        for n in range(1, args.count + 1):
            name = f"{entry['id']}_{n}"
            label = f"[{i}/{len(entries)}] {name}"
            if not args.force and list(out_dir.glob(f"{name}.*")):
                print(f"{label} : déjà généré, ignoré")
                skipped += 1
                continue
            print(f"{label} : génération...", flush=True)
            t0 = time.time()
            try:  # un nouveau seed est tiré à chaque build_workflow
                for p in run(build_workflow(template, entry, default_negative), out_dir, name):
                    print(f"    -> {p} ({time.time() - t0:.0f}s)")
                ok += 1
            except RuntimeError as e:  # un échec n'arrête pas la boucle
                print(f"    ERREUR : {e}")
                failed += 1

    print(f"\nTerminé : {ok} généré(s), {skipped} ignoré(s), {failed} en erreur.")


if __name__ == "__main__":
    main()
