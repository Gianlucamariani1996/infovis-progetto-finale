#
# Creato da Gianluca Mariani e Andrea Mariani il 13/07/2021 
#

# Questo codice serve per generare, a partire da un numero di blocco e da un'altezza, 
# un albero che rappresenta una porzione della blockchain di Ethereum. 
# In particolare, si restituisce l'albero in formato JSON.

# libreria utilizzata per generare un JSON a partire da un oggetto Python
import json
# libreria utilizzata per connettersi a un nodo della rete Ethereum e per prendere informazioni relative alla blockchain
from web3 import Web3
# libreria utilizzata per tirare su un API server che offre il servizio di generazione dell'albero
from flask import Flask, json, request
from flask_cors import CORS

# si crea una classe che rappresenta la struttura di un nodo dell'albero: l'unico campo obbligatorio è l'hash del blocco, 
# in quanto un blocco potrebbe essere un blocco uncle e quindi non avere delle informazioni che invece ha 
# un blocco della catena principale
class Tree(dict):
    def __init__(self, hash, height=None, trans_num=None, uncles=None, gas_limit=None, gas_used=None, miner=None, nonce=None,children=None):
        super().__init__()
        self.__dict__ = self
        self.hash = hash
        self.height = height
        self.trans_num = trans_num
        self.uncles = uncles
        self.gas_limit = gas_limit
        self.gas_used = gas_used
        self.miner = miner
        self.nonce = nonce
        if children is not None:
            self.children = children
        else:
            self.children = []

# viene effettuata la connessione a un nodo della rete di Ethereum
web3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/33319769ccc74511ac1eb90012e6f04c'))
if (web3.isConnected()):
    print("Connection successful" + "\n")
else:
    print("Connection refused" + "\n")

# funzione che, dato il numero di un blocco e l'altezza, genera l'albero corrispondente
def generate_tree(block_num, height):
    # si inizializza un dizionario che conterrà i blocchi uncle che vanno appesi tra i figli del proprio genitore.
    # In particolare si hanno delle coppie <chiave, valore> del tipo: 
    # <hash_blocco_genitore, [hash_blocco_uncle_1, ... , hash_blocco_uncle_n]>
    blocks_to_append = {}
    # si inizializza una lista che conterrà il numero totale delle transazioni e dei blocchi uncle presenti 
    # nella porzione di albero richiesta. Si usa una lista piuttosto che due variabili "int" separate, in modo da evitare,
    # in ogni funzione, di ritornare il valore aggiornato del numero di transazioni e 
    # di blocchi ("int": passaggio per valore, "list": passaggio per riferimento)
    total_trans_uncles_number = [0, 0]
    # si inizializza una lista che conterrà liste di due elementi (quindi una lista di coppie, di archi), 
    # dove ognuna di queste rappresenta un arco:
    # ["hash del blocco che da la ricompensa", "hash del blocco ricompensato"]
    # questo serve nel sistema di visualizzazione
    links_uncle_reward = []
    # si inizializza un dizionario che contiene gli hash dei minatori più famosi,
    # ogni volta che un blocco viene minato da uno di questi si incrementa il rispettivo valore
    all_famous_miner = { 
        "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8": ["Ethermine", 0],
        "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c": ["SparkPool", 0],
        "0x829BD824B016326A401d083B33D092293333A830": ["f2pool", 0],
        "0x1aD91ee08f21bE3dE0BA2ba6918E714dA6B45836": ["Hiveon Pool", 0],
        "Other": ["Altri", 0]
    }
    # 1 visita (genera: (i) la porzione di catena principale; (ii) i blocchi uncle che vanno successivamente attaccati al relativo genitore; (iii) gli archi da blocco che da la ricompensa a blocco uncle ricompensato):
    # se l'utente ha richiesto la generazione dell'albero a partire dall'ultimo blocco della blockchain, 
    # si genera un albero a partire da (numero dell'ultimo blocco - altezza dell'albero richiesta dall'utente)
    if block_num == "ultimo":
        block_num = int(web3.eth.getBlock("latest")["number"])
        generated_tree = generate_tree_aux(block_num - height, height - 1, block_num - height, blocks_to_append, total_trans_uncles_number, links_uncle_reward, all_famous_miner)
    # altrimenti (quindi l'utente ha dato esplicitamente il numero di blocco dal quale partire per disegnare l'albero),
    # si controlla se il numero di blocco è più grande dell'altezza inserita:
    # se lo è si controlla:
    # se l'altezza dell'albero richiesta è maggiore di 7, allora si può "prendere la ricorsa" di 7, 
    # in modo da generare un albero che, a partire dal blocco inserito, mostri i blocchi eventualmente ricompensati 
    # da questo (7 è la distanza massima alla quale si può trovare il blocco da ricompensare), 
    # altrimenti si genera un albero a partire da (numero di blocco inserito dall'utente - l'altezza inserita dall'utente)
    # se non lo è, significa che l'utente ha richiesto la generazione dell'albero ad esempio a partire 
    # dal blocco numero 6 di altezza 7, ma non esiste il blocco numero -1, quindi si parte a generare l'albero dal blocco 0.
    else:
        block_num = int(block_num)
        if block_num - height > 0:
            if height > 7:
                generated_tree = generate_tree_aux(block_num - 7, height - 1, block_num - 7, blocks_to_append, total_trans_uncles_number, links_uncle_reward, all_famous_miner)
            else: 
                generated_tree = generate_tree_aux(block_num - height + 1, height - 1, block_num - height + 1, blocks_to_append, total_trans_uncles_number, links_uncle_reward, all_famous_miner)
        else:
            generated_tree = generate_tree_aux(0, height - 1, 0, blocks_to_append, total_trans_uncles_number, links_uncle_reward, all_famous_miner)
        
    # 2 visita:
    # si appendono tutti i blocchi uncle trovati in precedenza, al rispettivo genitore. Questo va fatto perché se 
    # c'è stata una fork si sa dopo e quindi si sa quando un blocco ha ricompensato un blocco uncle e questo 
    # blocco uncle ha l'hash del blocco genitore al quale doveva essere attaccato
    append_blocks(generated_tree, blocks_to_append, total_trans_uncles_number)

    # si prendono i minatori che effettivamente hanno minato dei blocchi nella porzione di albero richiesta 
    famous_miner = {}
    for key in all_famous_miner:
        if all_famous_miner[key][1] != 0:
            famous_miner[all_famous_miner[key][0]] = all_famous_miner[key][1]

    # si restituisce un JSON della forma:
    # {
    # totale transazioni,
    # totali blocchi uncle, 
    # archi da blocchi che ricompensano a blocchi uncle ricompensati,
    # albero,
    # minatori 
    # }
    string_of_trans_uncles_tree = json.dumps([total_trans_uncles_number[0], total_trans_uncles_number[1], links_uncle_reward, generated_tree, famous_miner])
    return string_of_trans_uncles_tree

def generate_tree_aux(root, height, height_root, blocks_to_append, total_trans_uncles_number, links_uncle_reward, all_famous_miner):
    # a partire dal numero di blocco si prendono tutte le informazioni
    block = web3.eth.getBlock(root)
    root_hash = block["hash"].hex()
    uncles_number = web3.eth.get_uncle_count(root)
    block_height = block["number"]
    trans_num = web3.eth.get_block_transaction_count(root)
    uncles = []
    for i in range(uncles_number):
        uncles.append(web3.eth.get_uncle_by_block(root, i)['hash'])
    gas_limit = block['gasLimit']
    gas_used = block['gasUsed']
    miner = block['miner']
    nonce = block['nonce'].hex()

    # si incrementa i numeri blocchi minati dal minatore del blocco corrente
    if miner not in all_famous_miner:
        all_famous_miner["Other"][1] += 1
    else:
        all_famous_miner[miner][1] += 1

    # si incrementano le transazioni totali
    total_trans_uncles_number[0] += trans_num
    tree = Tree(root_hash, block_height, trans_num, uncles, gas_limit, gas_used, miner, nonce)

    if height == 0:
        generate_blocks_to_append(root, root_hash, uncles_number, height_root, blocks_to_append, links_uncle_reward)
    else: 
        tree.children.append(generate_tree_aux(root + 1, height -1, height_root, blocks_to_append, total_trans_uncles_number, links_uncle_reward, all_famous_miner))
        generate_blocks_to_append(root, root_hash, uncles_number, height_root, blocks_to_append, links_uncle_reward)
        
    return tree

# funzione che: (i) genera i blocchi uncle da appendere al rispettivo genitore; (ii) genera gli archi tra blocco che ricompensa e blocchi uncle ricompensati; (iii) incrementa il numero totale di blocchi uncle presenti nella porzione di albero
def generate_blocks_to_append(root, root_hash, uncles_number, height_root, blocks_to_append, links_uncle_reward):
    for i in range(uncles_number):
        uncle = web3.eth.get_uncle_by_block(root, i)

        links_uncle_reward.append([root_hash, uncle["hash"]])
        fork_height = web3.eth.getBlock(uncle["parentHash"])["number"]
        if fork_height >= height_root:
            if uncle["parentHash"] not in blocks_to_append:
                blocks_to_append[uncle["parentHash"]] = [Tree(uncle["hash"])]
            else:
                blocks_to_append[uncle["parentHash"]] = blocks_to_append[uncle["parentHash"]] + [Tree(uncle["hash"])]

# 2 visita: si appendono i blocchi uncle generati in precedenza al rispettivo genitore
def append_blocks(tree, blocks_to_append, total_trans_uncles_number):
    for key in blocks_to_append:
        if key == tree.hash:
            for e in blocks_to_append[key]:
                total_trans_uncles_number[1] += 1
                tree.children.append(e)            
    for child in tree.children:
        append_blocks(child, blocks_to_append, total_trans_uncles_number)

api = Flask(__name__)
CORS(api)

@api.route('/generate-tree', methods=['GET'])
def get_companies():
    block = request.args.get('block')
    height = request.args.get('height')
    return generate_tree(block, int(height))

api.run()