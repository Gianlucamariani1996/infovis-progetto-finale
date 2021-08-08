import json
from web3 import Web3
from flask import Flask, json, request
from flask_cors import CORS

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

web3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/33319769ccc74511ac1eb90012e6f04c'))
if (web3.isConnected()):
    print("Connection successful" + "\n")
else:
    print("Connection refused" + "\n")

def generate_tree(block_num, height):
    blocks_to_append = {}
    # si usa la lista per il passaggio per valore/riferimento
    total_trans_uncles_number = [0, 0]
    links_uncle_reward = []
    famous_miner = {}

    if block_num >= 7:
        generated_tree = generate_tree_aux(block_num - 7, height - 1, block_num - 7, blocks_to_append, total_trans_uncles_number, links_uncle_reward, famous_miner)
    else:
        generated_tree = generate_tree_aux(0, height - 1, 0, blocks_to_append, total_trans_uncles_number, links_uncle_reward, famous_miner)

    append_blocks(generated_tree, blocks_to_append, total_trans_uncles_number)

    string_of_trans_uncles_tree = json.dumps([total_trans_uncles_number[0], total_trans_uncles_number[1], links_uncle_reward, generated_tree, famous_miner])
    return string_of_trans_uncles_tree

def generate_tree_aux(root, height, height_root, blocks_to_append, total_trans_uncles_number, links_uncle_reward, famous_miner):
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

    if miner not in famous_miner:
        famous_miner[miner] = 1
    else:
        famous_miner[miner] += 1

    total_trans_uncles_number[0] += trans_num
    tree = Tree(root_hash, block_height, trans_num, uncles, gas_limit, gas_used, miner, nonce)

    if height == 0:
        generate_blocks_to_append(root, root_hash, uncles_number, height_root, blocks_to_append, links_uncle_reward)
    else: 
        tree.children.append(generate_tree_aux(root + 1, height -1, height_root, blocks_to_append, total_trans_uncles_number, links_uncle_reward, famous_miner))
        generate_blocks_to_append(root, root_hash, uncles_number, height_root, blocks_to_append, links_uncle_reward)
        
    return tree

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
    return generate_tree(int(block), int(height))

api.run()