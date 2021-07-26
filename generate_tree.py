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

blocks_to_append = {}

def generate_tree(num_block):
    generated_tree = generate_tree_aux(num_block - 5, 9, num_block - 5)

    append_blocks(generated_tree, blocks_to_append)

    string_of_tree = json.dumps(generated_tree.__dict__)
    
    return string_of_tree

def generate_tree_aux(root, height, height_root):
    root_hash = web3.eth.getBlock(root)["hash"].hex()[:7]
    uncles_number = web3.eth.get_uncle_count(root)

    tree = Tree(root_hash, [])

    if height == 0:
        generate_blocks_to_append(root, uncles_number, height_root)
    else: 
        tree.children.append(generate_tree_aux(root + 1, height -1, height_root))
        generate_blocks_to_append(root, uncles_number, height_root)
        
    return tree

def generate_blocks_to_append(root, uncles_number, height_root):
    for i in range(uncles_number):
        uncle = web3.eth.get_uncle_by_block(root, i)
        fork_height = web3.eth.getBlock(uncle["parentHash"])["number"]
        if fork_height >= height_root:
            if uncle["parentHash"][:7] not in blocks_to_append:
                blocks_to_append[uncle["parentHash"][:7]] = [Tree(uncle["hash"][:7], [])]
            else:
                blocks_to_append[uncle["parentHash"][:7]] = blocks_to_append[uncle["parentHash"][:7]] + [Tree(uncle["hash"][:7], [])]

def append_blocks(tree, blocks_to_append):
    for key in blocks_to_append:
        if key == tree.name:
            for e in blocks_to_append[key]:
                tree.children.append(e)            
    for child in tree.children:
        append_blocks(child, blocks_to_append)

api = Flask(__name__)
CORS(api)

@api.route('/generate-tree', methods=['GET'])
def get_companies():
    height = request.args.get('height')
    return generate_tree(int(height))

api.run()