// import Web3 from "web3";
const Web3 = require("web3");
// import starNotaryArtifact from "../../build/contracts/StarNotary.json";
const starNotaryArtifact = require("../../build/contracts/StarNotary.json");

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      
      const networkId = await web3.eth.net.getId();
      console.log(starNotaryArtifact.networks[networkId]);
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      console.log(starNotaryArtifact);
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      // const accounts = await web3.eth.requestAccounts();
      this.account = accounts[0];

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function () {
    try {
      const { createStar } = this.meta.methods;
      const name = document.getElementById("starName").value;
      const id = document.getElementById("starId").value;

      // const nonce = await App.web3.eth.getTransactionCount(this.account, 'latest'); // get latest nonce
      // const gasEstimate = await createStar(name,id).estimateGas(); // estimate gas

      await createStar(name, id).send({ from: this.account });
      App.setStatus("New Star Owner is " + this.account + ".");
    }
    catch (error) {
      App.setStatus(error.message);
    }
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const id = document.getElementById("lookid").value;
    let starName = await lookUptokenIdToStarInfo(id).call({ from: this.account });
    App.setStatus(`Star name is ${starName}`);
  }

};
window.App = App;

window.addEventListener("load", async function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts from Metamask
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"),);
  }

  App.start();
});