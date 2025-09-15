
import csv
import random

def randomOrientation():
    isPositive = random.choice(true, false)

def calculateReturn(portefeuille, variation):
    print("plus value = ", (portefeuille * (variation / 100)))
    return portefeuille * (variation / 100)

def readFile():
    # Open the CSV file
    with open("CAC_40_Donnees_Historiques.csv", newline='') as csvfile:
    
        # Create a CSV reader object
        csvreader = reversed(list(csv.reader(csvfile)))
        

        csvList = []
        # Read and print each row
        for row in csvreader:
            csvList.append(row)
            #print(row)

            
        enTete = csvList[len(csvList)-1]

        csvList.pop(len(csvList)-1)
        #print(enTete)
        csvList.insert(0, enTete)
        print(csvList)
        return csvList

def simulerInvestissement(historiqueValeurs):
    valeurInitiale = 10000
    portefeuille = 10000
    portefeuilleHold = 10000
    listeReponses = []
    for i in range(20, len(historiqueValeurs)):
        # print("liste en entree llm :")
        # print(csvList[:i-1])
        print("--------------------")
        isPositive = random.choice([True, False])
        print("ligne attendue : ")
        print(historiqueValeurs[i])
        variation = float(historiqueValeurs[i][6].replace("%", "").replace(",", "."))
        print("variation : ", variation)
        print("prediction : ", isPositive)
        if isPositive and variation > 0:
            listeReponses.append(True)
            print("victoire")
            portefeuille += calculateReturn(portefeuille, variation)
        if isPositive and variation < 0:
            listeReponses.append(False)
            portefeuille += calculateReturn(portefeuille, variation)
        if isPositive == False and variation > 0:
            listeReponses.append(False)
            portefeuille -= calculateReturn(portefeuille, variation)
        if isPositive == False and variation < 0:
            listeReponses.append(True)
            print("victoire")
            portefeuille -= calculateReturn(portefeuille, variation)
        portefeuilleHold += calculateReturn(portefeuilleHold, variation)
        


    print(listeReponses)
    totaBonnesRep = 0
    for i in range(0, len(listeReponses)):
        if(listeReponses[i] == True):
            totaBonnesRep +=1
    variationFinale = ((portefeuille - valeurInitiale) / valeurInitiale) * 100
    plusValueFinale = portefeuille - valeurInitiale
    print("bonnes reponses : ", totaBonnesRep , " / ", len(listeReponses))
    print("portefeuille final : ", portefeuille)
    print("variation finale : ", variationFinale , "%")
    print("resultat hold : ", ((portefeuilleHold - valeurInitiale) / valeurInitiale) * 100 , "%")
    return plusValueFinale

listeValeur = readFile()
plusValues = []
nombreEchantillons = 1000

for i in range(nombreEchantillons):
    plusValues.append(simulerInvestissement(listeValeur))

totalPlusValues = 0
for i in range(len(plusValues)):
    totalPlusValues += plusValues[i]

print("moyenne des plus values = " , totalPlusValues/nombreEchantillons)
print("moyenne des rendements = " , totalPlusValues/nombreEchantillons / 10000 * 100 , "%")
