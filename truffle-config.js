const HDWalletProvider = require("truffle-hdwallet-provider");
const result = require('dotenv').config(); // read .env file saved in project root
if (result.error) {
  throw result.error;
}

const hecoChainProvider = (network) => {
  let rpcs = {
    'mainnet': 'https://http-mainnet.hecochain.com',
    'testnet': 'https://http-testnet.hecochain.com'
  }
  return new HDWalletProvider(process.env.DEPLOYER_PRIVATE_KEY || '', rpcs[network])
};

const bnbChainProvider = (network) => {
  let rpcs = {
    'mainnet': 'https://bsc-dataseed.binance.org',
    'testnet': 'https://data-seed-prebsc-1-s1.binance.org:8545'
  }
  return new HDWalletProvider(process.env.DEPLOYER_PRIVATE_KEY || '', rpcs[network])
};

module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //

  // Modify to the correct migration directory when using
  // migrations_directory: "./migrations/ignore_migrations",
  migrations_directory: "./migrations/",
  networks: {
    hecomainnet: {
      provider: hecoChainProvider('mainnet'),
      network_id: "*",  // match any network
      gas: 6721975,
      networkCheckTimeout: 60000,
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    remote: {
      host: '8.129.187.233',
      port: 28545,
      // gasPrice: 100000000000, // 100 gwei
      gas: 6721975,
      network_id: '*',
    },
    hecotestnet: {
      provider: hecoChainProvider('testnet'),
      network_id: "256",  // match any network
      gas: 6721975,
      networkCheckTimeout: 60000,
    },
    bnbtestnet: {
      provider: bnbChainProvider('testnet'),
      network_id: "97",  // match any network
      gas: 6721975,
      networkCheckTimeout: 60000,
    },
    bnbmainnet: {
      provider: bnbChainProvider('mainnet'),
      network_id: "56",  // match any network
      gas: 6721975,
      networkCheckTimeout: 60000,
    }
  },
  //
  compilers: {
    solc: {
      version: "0.6.12",
      "optimizer": {
        "enabled": true,
        "runs": 200
      }
    }
  }
};
