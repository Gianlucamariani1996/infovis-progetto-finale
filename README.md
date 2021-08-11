# Visualizzazione della blockchain di Ethereum

Questo repository contiene il codice relativo al progetto svolto da Andrea Mariani e Gianluca Mariani,
relativo al corso di [Visualizzazione delle informazioni](http://www.dia.uniroma3.it/~infovis/index.php),
tenuto dal prof. [Maurizio Patrignani](https://compunet.ing.uniroma3.it/#!/people/titto),
nell'anno accademico 2020-2021.

## Accesso al repository 

Per effettuare il download del repository:

    git clone https://github.com/mdelia17/lambda-architecture.git

Oppure se il sistema host è Windows:

    git clone --config core.autocrlf=input https://github.com/mdelia17/lambda-architecture.git

Per aggiornare il contenuto della propria copia locale del repository: 

    git pull 

## Organizzazione del repository 

Questo repository è organizzato in due sezioni (cartelle):
* [backend](backend/): contenente un file python che implementa un API server che espone un end-point `GET /generate-tree?block={block}&height={height}` costruisce un albero di altezza data a partire dal numero di blocco dato;
* [frontend](frontend/): contenente i file per il sistema di visualizzazione;

![](architettura.PNG)

## Obiettivi

L'obiettivo di questo progetto è stato quello di sviluppare un interfaccia che permettesse di visualizzare i blocchi uncle, fondamentali 
per la sicurezza della blockchain di Ethereum (ref paper), in modo da capirne meglio il fenomeno e la frequenza, e quello di, una volta recuperata 
una porzione di albero, visualizzare informazioni utili per fare analisi come: numero di transazioni complessive (mostrate rispetto alla media), numero di 
blocchi uncle complessivi (mostrati rispetto al numero massimo, considerando che al massimo possono essere due per blocco) e i minatori dei blocchi 
(parlare di mining-pool). Inoltre viene data la possibilità di fare analisi in near-streaming mettendo "ultimo"....


## Prerequisiti

Per utilizzare il repository è necessario avere installato:
* [Python] 3;
* [package web3] 5.21.0 (pip install web3==5.21.0);

## Utilizzo del repository

Per l'avvio è necessario aprire due shell, ciascuna posizionata in una delle due cartelle (frontend, backend).

Nel tab backend:
* eseguire `python generate_tree.py` per avviare l'API server

Nel tab frontend:
* eseguire `sh startup.sh` per avviare il web server

A questo punto, aprire il borwser di riferimento e digitare http:://localhost:[porta]
