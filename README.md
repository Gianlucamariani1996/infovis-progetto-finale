# Visualizzazione della blockchain di Ethereum

Questo repository contiene il codice relativo al progetto svolto da Andrea Mariani e Gianluca Mariani,
relativo al corso di [Visualizzazione delle informazioni](http://www.dia.uniroma3.it/~infovis/index.php),
tenuto dal prof. [Maurizio Patrignani](https://compunet.ing.uniroma3.it/#!/people/titto),
nell'anno accademico 2020-2021.

## Accesso al repository 

Per effettuare il download del repository:

    git clone https://github.com/mdelia17/lambda-architecture.git

## Organizzazione del repository 

Questo repository è organizzato in due sezioni (cartelle):
* [backend](backend/): contenente un file python che implementa un API server il quale mette a disposizione il seguente end-point `GET /generate-tree?block={block}&height={height}`, quest'ultimo permette di costruire un albero a partire dal numero di blocco ed l'altezza dati;
* [frontend](frontend/): contenente i file relativi al sistema di visualizzazione.

![](architettura.png)

## Obiettivi

L'obiettivo di questo progetto è stato quello di sviluppare un sistema di visualizzazione che permettesse di:
* visualizzare i blocchi uncle [[1]](https://medium), in modo da capirne meglio il fenomeno e la frequenza;
* una volta recuperata una porzione della blockchain, visualizzare informazioni utili per fare analisi, come ad esempio: 
  * il numero di transazioni complessive (mostrate rispetto alla media [[2]](https://a));
  * il numero di blocchi uncle complessivi mostrati rispetto al numero massimo possibile (due per blocco [[3]](https://paper));
  * per ciascuno dei minatori più famosi il numero di blocchi minati [[4]](https://medium-mining-pool). 

## Implementazione

Per connettersi ad un nodo della rete Ethereum è stato utilizzato il package web3.py [[5]](https://https://web3py.readthedocs.io/en/stable/).

Per rappresentare l'albero è stato utilizzato il layout `tree` offerto da D3 [[6]](https://d3) che implementa l'algoritmo di Reingold–Tilford. 

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

## Utilizzo del sistema di visualizzazione
Una volta avviato il sistema di visualizzazione, si deve compilare la form:
* nel campo "Altezza" si inserisce l'altezza dell'albero che si vuole visualizzare;
* nel campo "Numero di blocco" si può inserire:
  * il numero del blocco, il quale verrà preso come riferimento per disegnare l'albero. In caso di fork ci sono dei blocchi abortiti, ciascun blocco abortito che è     discendente diretto di un blocco della catena principale, può essere indicato come blocco uncle da uno dei blocchi successivi della catena principale (chiamato     quindi nipote), fino ad una distanza massima di 6 blocchi dopo la fork [[7]](https://paper). Quindi, se l'altezza inserita è minore di 7, l'albero viene
    costruito a ritroso, altrimenti si prende una "rincorsa" di 7 blocchi e si disegna l'albero;
  * la stringa "ultimo", questa consente di prendere come riferimento il blocco più recente per la costruzione dell'albero, e quindi di fare analisi relativamente       alla porzione più recente della blockchain.
