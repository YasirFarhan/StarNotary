var assert = require('assert');

const StarNotary = artifacts.require("starNotary");

var accounts;
var owner;
let starnotary;

contract('StarNotary', async (accs) => {
    accounts = accs;
    owner = accounts[0];
});

beforeEach(async () => {
    starnotary = await StarNotary.deployed();
});

it('can Create a Star', async () => {
    let tokenId = 1;
    await starnotary.createStar('Awesome Star!', tokenId, { from: accounts[0] })
    assert.equal(await starnotary.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('can put Star for sale', async () => {
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await starnotary.createStar('awesome star', starId, { from: user1 });
    await starnotary.putStarForSale(starId, starPrice, { from: user1 });
    assert.equal(await starnotary.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    let user1 = accounts[3];
    let user2 = accounts[4];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await starnotary.createStar('awesome star', starId, { from: user1 });
    await starnotary.putStarForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await starnotary.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it(' lookUptokenIdToStarInfo', async () => {
    let starName = "awesomeStar";
    let starId = 9;
    let user1 = accounts[2];
    await starnotary.createStar(starName, starId, { from: user1 });
    let lookUpStarName = await starnotary.lookUptokenIdToStarInfo(starId, { from: user1 });
    assert.equal(starName, lookUpStarName);
})



it(' exchange is possible', async () => {
    let star1Name = "awesomeStar1";
    let star2Name = "awesomeStar2";
    let star1Id = 10;
    let star2Id = 11;
    let user1 = accounts[6];
    let user2 = accounts[7];
    await starnotary.createStar(star1Name, star1Id, { from: user1 });
    await starnotary.createStar(star2Name, star2Id, { from: user2 });
    await starnotary.exchangeStars(star1Id, star2Id, { from: user1 });

    let ownerOfStar1 = await starnotary.ownerOf(star1Id);
    let ownerOfStar2 = await starnotary.ownerOf(star2Id);

    assert.equal(user1, ownerOfStar2);
    assert.equal(user2, ownerOfStar1);
})

it(' trasnfer with no cost', async () => {
    let starName = "awesomeStar3";
    let starId = 22;
    let user1 = accounts[6];
    let user2 = accounts[7];

    await starnotary.createStar(starName, starId, { from: user1 });
    await starnotary.transferStar(user2, starId, { from: user1 });

    let ownerOfStar = await starnotary.ownerOf(starId);

    assert.equal(user2, ownerOfStar);

})