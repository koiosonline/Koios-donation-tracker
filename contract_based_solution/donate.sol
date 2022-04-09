// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract KoiosDonation {
    address public owner;
    address public donationAccount;
    uint256 public ethBalance;

    address[] supportedTokens;

    /// tracks the lifetime donations of users.
    mapping(address /*user*/ => mapping(address /*token*/ => uint256 /*value*/)) userTokenBalance;
    
    event EthDonationReceived(address _from, uint _amount);
    event TokenDonationReceived(address _from, uint _amount, address _token);
    
    constructor(address _donation_account) {
        owner = msg.sender;
        donationAccount = _donation_account;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owners can execute this method");
        _;
    }

    // wen moon?
    function changeDonationAccount(address _new_acc) public onlyOwner {
        donationAccount = _new_acc;
    }

    // send all supported tokens along with the ethereum inside this contract.
    function withdraw() public onlyOwner {
        if(ethBalance > 0){
            withdrawEth(ethBalance);
        }
        for(uint i = 0; i < supportedTokens.length; i++){
            uint256 cb = getContractTokenBalance(supportedTokens[i]);
            if(cb > 0){
                withdrawToken(supportedTokens[i], cb);
            }
        }
    }


/*
-------------------------------------------------------
--------------------- ETH section ---------------------
-------------------------------------------------------
*/
    receive() payable external {
        ethBalance += msg.value;
        emit EthDonationReceived(msg.sender, msg.value);
    }

    function withdrawEth(uint amount) public onlyOwner {
        require(amount <= ethBalance, "Insufficient funds");
        
        payable(donationAccount).transfer(amount);
        ethBalance -= amount;
    }

/*
-------------------------------------------------------
--------------------- ERC20 section -------------------
-------------------------------------------------------
*/

    function tokenIsSupported(address _token) private view returns(bool){
        for(uint i = 0; i < supportedTokens.length; i++){
            if(supportedTokens[i] == _token){
                return true;
            }
        }
        return false;
    }

    /*
        NOTE:
        We could theoretically remove this and allow the user to send all tokens which would reduce
        gas on the individual donations.. but that's generally not so friendly..
    */
    modifier OnlySupportedToken(address _token) {
        require(tokenIsSupported(_token), "Token not supported");
        _;
    }

    function donateToken(address _token) public OnlySupportedToken(_token) {
        // 1. Mitigate potential attack by setting allowance to 0 -> https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit
        // 2. EXTERNALLY set allowance for this contract to the supplied amount (if we do it here, this will be the caller).
        // 3. Check the allowance that this contract is allowed (since we don't have this yet)..
        IERC20 token = IERC20(_token);
        uint256 dontatedAmount = token.allowance(msg.sender, address(this));
        require(dontatedAmount > 0, "Amount to donate must be greater than 0");
        // 4. withdraw the amount towards this contract
        bool sc = token.transferFrom(msg.sender, address(this), dontatedAmount);
        // 5. increment the donated amount of the user
        if(sc){
            userTokenBalance[msg.sender][_token] += dontatedAmount;
            emit TokenDonationReceived(msg.sender, dontatedAmount, _token);
        }
    }

    /// Gets the balance of this contract within a specific token.
    function getContractTokenBalance(address _tokenAdress) public view returns(uint256) {
        return IERC20(_tokenAdress).balanceOf(address(this));
    }

    /// Fetches the amount donated by the user in the supplied token.
    function getUserTokenDonations(address _user, address _token) public view returns(uint256){
        return userTokenBalance[_user][_token];
    }

    struct UserBalance {
        string name;
        uint256 amount;
        address token;
    }
    /// Get all donations in all supported tokens from the provided user.
    function getAllDonationsFromUser(address _user) public view returns(UserBalance[] memory tmp){
        for(uint i = 0; i < supportedTokens.length; i++){
            tmp[i] = UserBalance(ERC20(supportedTokens[i]).name(), userTokenBalance[_user][supportedTokens[i]], supportedTokens[i]);
        }
        return tmp;
    }

    /// Withdraw the given token from the smart contract to the donationAccount
    function withdrawToken(address token_addr, uint256 amount) public onlyOwner {
        IERC20 token = IERC20(token_addr);
        uint256 erc20balance = token.balanceOf(address(this));
        require(amount <= erc20balance, "balance is low");
        token.transfer(donationAccount, amount);
    }

    /// Gets all the supported ERC20 tokens of this contract. please note that the order of the tokens might change!.
    function getSupportedTokens() public view returns(address[] memory){
        return supportedTokens;
    }

    /// Adds support for another token within this contract. note that unsupported ERC20 tokens may still be sent to this contract.
    function addSupportedToken(address token) public onlyOwner {
        supportedTokens.push(token);
    }

    /// FUS RO DAH!!
    function removeSupportedToken(uint32 index) public onlyOwner {
        supportedTokens[index] = supportedTokens[supportedTokens.length - 1];
        supportedTokens.pop();
    }

}