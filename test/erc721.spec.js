import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const { expect, assert } = chai

var MyUniqueCollectables = artifacts.require("MyUniqueCollectables");

contract('Testing ERC721 contract', function(accounts) {

    let token;
    const name = "BlueCat";
    const symbol = "BCat"

    const account1 = accounts[1]
    const account2 = accounts[2]
    const account3 = accounts[3]
    const account4 = accounts[4]
    const account5 = accounts[5]
    
    const tokenId1 = 1111;
    const tokenId2 = 2222;
    const tokenId3 = 3333;
    const tokenId4 = 4444;
    const tokenId5 = 5555;


    it(' should be able to deploy and mint ERC721 token', async () => {
        token = await MyUniqueCollectables.new(name, symbol)
        // await token.mintUniqueTokenTo(account1, tokenId1, tokenUri1, {from: accounts[0]})
        await token.myExMint(account1, tokenId1, {from: accounts[0]})

        expect(await token.symbol()).to.equal(symbol)
        expect(await token.name()).to.equal(name)
    })

    it(' should be unique', async () => {
        const duplicateTokenID = token.myExMint(account2, tokenId1, {from: accounts[0]}) //tokenId
        expect(duplicateTokenID).to.be.rejectedWith(/VM Exception while processing transaction: revert/)
    })

    it(' should allow creation of multiple unique tokens and manage ownership', async () => {
        const additionalToken = await token.myExMint(account2, tokenId2, {from: accounts[0]})
        expect(Number(await token.totalSupply())).to.equal(2)

        expect(await token.exists(tokenId1)).to.be.true
        expect(await token.exists(tokenId2)).to.be.true
        expect(await token.exists(9999)).to.be.false // Dummy tokenId

        expect(await token.ownerOf(tokenId1)).to.equal(account1)
        expect(await token.ownerOf(tokenId2)).to.equal(account2)
    })

    it(' should only allow contract owner to mint new tokens', async () => {
        const nonOwnerMint = token.myExMint(account3, tokenId5, {from: accounts[1]})
        expect(nonOwnerMint).to.be.rejectedWith(/VM Exception while processing transaction: revert/)
    })

    it(' should only mint new token if total tokens is less than max allowed tokens', async () => {
        // ensure starting supply is 2 so we can test 3+
        expect(Number(await token.totalSupply())).to.equal(2) // max tokens


        const additionalToken3 = await token.myExMint(account3, tokenId3, {from: accounts[0]})
        expect(Number(await token.totalSupply())).to.equal(3) // max tokens

        const additionalToken4 = token.myExMint(account4, tokenId4, {from: accounts[0]})
        expect(additionalToken4).to.be.rejectedWith(/VM Exception while processing transaction: revert/)
    })

    it(' should allow safe transfers', async () => {
        const unownedTokenId = token.safeTransferFrom(account2, account3, tokenId1, {from: accounts[2]}) // tokenId
        expect(unownedTokenId).to.be.rejectedWith(/VM Exception while processing transaction: revert/)

        const wrongOwner = token.safeTransferFrom(account1, account3, tokenId2, {from: accounts[1]}) // wrong owner
        expect(wrongOwner).to.be.rejectedWith(/VM Exception while processing transaction: revert/)

        // Noticed that the from gas param needs to be the token owners or it fails
        const wrongFromGas = token.safeTransferFrom(account2, account3, tokenId2, {from: accounts[1]}) // wrong owner
        expect(wrongFromGas).to.be.rejectedWith(/VM Exception while processing transaction: revert/)

        await token.safeTransferFrom(account2, account3, tokenId2, {from: accounts[2]})
        expect(await token.ownerOf(tokenId2)).to.equal(account3)
    })

    it(' should emit transfer event upon successful safe token transfer', async () => {
        const transferTxReceipt = await token.safeTransferFrom(account3, account2, tokenId3, {from: accounts[3]})
        expect(transferTxReceipt.logs[0].event).to.equal('Transfer')
    })
})