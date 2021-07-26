import json
from web3 import Web3
from flask import Flask, json, request
from flask_cors import CORS

class Tree(dict):
    def __init__(self, name, children=None):
        super().__init__()
        self.__dict__ = self
        self.name = name
        if children is not None:
            self.children = list(children)
        else:
            self.children = []

web3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/33319769ccc74511ac1eb90012e6f04c'))
if (web3.isConnected()):
    print("Connection successful" + "\n")
else:
    print("Connection refused" + "\n")

uncle_to_append = {}

def generate_tree(num_block):
    tree_before = generate_tree_aux(num_block - 5, 5, num_block - 5)
    tree_after = generate_tree_aux(num_block + 1, 3, num_block - 5)

    junction_of_trees(tree_before, tree_after, num_block)

    # è stato appeso il tree_after al tree_before, quindi da adesso in poi si considera il tree_before che rappresenta tutto l'albero
    append_uncle(tree_before, uncle_to_append)

    string_of_final_tree = json.dumps(tree_before.__dict__)
    
    return string_of_final_tree
    # json_file = open("./data/data.json", "w")
    # json_file.write(string_of_final_tree)
    # json_file.close()

def generate_tree_aux(root, height, height_root):

    root_hash = web3.eth.getBlock(root)["hash"].hex()[:7]
    number_uncles = web3.eth.get_uncle_count(root)

    tree = Tree(root_hash, [])

    if height == 0:
        for i in range(number_uncles):
            uncle = web3.eth.get_uncle_by_block(root, i)
            fork_height = web3.eth.getBlock(uncle["parentHash"])["number"]
            if fork_height >= height_root:
                if uncle["parentHash"][:7] not in uncle_to_append:
                    uncle_to_append[uncle["parentHash"][:7]] = [Tree(uncle["hash"][:7], [])]
                else:
                    uncle_to_append[uncle["parentHash"][:7]] = uncle_to_append[uncle["parentHash"][:7]] + [Tree(uncle["hash"][:7], [])]
        return tree
    else: 
        tree.children.append(generate_tree_aux(root + 1, height -1, height_root))
        for i in range(number_uncles):
            uncle = web3.eth.get_uncle_by_block(root, i)
            fork_height = web3.eth.getBlock(uncle["parentHash"])["number"]
            if fork_height >= height_root:
                if uncle["parentHash"][:7] not in uncle_to_append:
                    uncle_to_append[uncle["parentHash"][:7]] = [Tree(uncle["hash"][:7], [])]
                else:
                    uncle_to_append[uncle["parentHash"][:7]] = uncle_to_append[uncle["parentHash"][:7]] + [Tree(uncle["hash"][:7], [])]
        return tree

# si visita l'albero e quando si arriva al punto giusto si fa la giunzione
def junction_of_trees(tree_before, tree_after, num_block):
    if tree_before.name == web3.eth.getBlock(num_block)["hash"].hex()[:7]:
        tree_before.children.insert(0, tree_after)
    else:
        junction_of_trees(tree_before.children[0], tree_after, num_block)

def append_uncle(tree, uncle_to_append):
    for key in uncle_to_append:
        if key == tree.name:
            for e in uncle_to_append[key]:
                tree.children.append(e)            
    for child in tree.children:
        append_uncle(child, uncle_to_append)

# generate_tree(122)

api = Flask(__name__)
CORS(api)

@api.route('/generate-tree', methods=['GET'])
def get_companies():
    n = request.args.get('height')
    return generate_tree(int(n))

api.run()
# prima era scritto così
# if __name__ == '__main__':
#     api.run()