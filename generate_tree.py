import json
from web3 import Web3
from flask import Flask, json, request
from flask_cors import CORS

class Tree(dict):
    def __init__(self, name, trans_num=None, uncles=None, gas_limit=None, gas_used=None, children=None):
        super().__init__()
        self.__dict__ = self
        self.name = name
        self.trans_num = trans_num
        self.uncles = uncles
        self.gas_limit = gas_limit
        self.gas_used = gas_used
        if children is not None:
            self.children = children
        else:
            self.children = []

web3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/33319769ccc74511ac1eb90012e6f04c'))
if (web3.isConnected()):
    print("Connection successful" + "\n")
else:
    print("Connection refused" + "\n")

def generate_tree(block_num, height):
    blocks_to_append = {}
    if block_num >= 7:
        generated_tree = generate_tree_aux(block_num - 7, height - 1, block_num - 7, blocks_to_append)
    else:
        generated_tree = generate_tree_aux(0, height - 1, 0, blocks_to_append)
    append_blocks(generated_tree, blocks_to_append)

    string_of_tree = json.dumps(generated_tree.__dict__)
    return string_of_tree

def generate_tree_aux(root, height, height_root, blocks_to_append):
    block = web3.eth.getBlock(root)
    root_hash = block["hash"].hex()[:7]
    uncles_number = web3.eth.get_uncle_count(root)
    trans_num = web3.eth.get_block_transaction_count(root)
    uncles = []
    for i in range(uncles_number):
        uncles.append(web3.eth.get_uncle_by_block(root, i)['hash'][:7])
    gas_limit = block['gasLimit']
    gas_used = block['gasUsed']

    tree = Tree(root_hash, trans_num, uncles, gas_limit, gas_used)

    if height == 0:
        generate_blocks_to_append(root, uncles_number, height_root, blocks_to_append)
    else: 
        tree.children.append(generate_tree_aux(root + 1, height -1, height_root, blocks_to_append))
        generate_blocks_to_append(root, uncles_number, height_root, blocks_to_append)
        
    return tree

def generate_blocks_to_append(root, uncles_number, height_root, blocks_to_append):
    for i in range(uncles_number):
        uncle = web3.eth.get_uncle_by_block(root, i)
        fork_height = web3.eth.getBlock(uncle["parentHash"])["number"]
        if fork_height >= height_root:
            if uncle["parentHash"][:7] not in blocks_to_append:
                blocks_to_append[uncle["parentHash"][:7]] = [Tree(uncle["hash"][:7])]
            else:
                blocks_to_append[uncle["parentHash"][:7]] = blocks_to_append[uncle["parentHash"][:7]] + [Tree(uncle["hash"][:7])]

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
    block = request.args.get('block')
    height = request.args.get('height')
    return generate_tree(int(block), int(height))

api.run()