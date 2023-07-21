// SPDX-License-Identifier: MIT 
pragma solidity 0.8.16;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IWETH.sol";
import "./libraries/DecimalMath.sol";
import "./libraries/UniversalERC20.sol";
import  "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MisesSwapRouter is Ownable{

    using UniversalERC20 for IERC20;
    address constant _ETH_ADDRESS_ = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address public constant _WETH_ = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    constructor(){

    }
    function externalSwap(
    address fromToken,
    address toToken,
    uint256 fromTokenAmount,
    address swapTarget,
    address approveTarget,
    bytes memory callDataConcat
    ) external payable returns (uint256 receiveAmount) {      
        // swap
        uint256 toTokenOriginBalance;
        uint256 fromTokenOriginBalance;
        if (fromToken != _ETH_ADDRESS_) {
          toTokenOriginBalance = IERC20(toToken).universalBalanceOf(address(this));
          fromTokenOriginBalance = IERC20(fromToken).universalBalanceOf(msg.sender);
          require(fromTokenOriginBalance >= fromTokenAmount,"invalid token amount");
          require(approveTarget != address(0),"invalid approveTarget");
          SafeERC20.safeTransferFrom(IERC20(fromToken),msg.sender, address(this), fromTokenAmount);
          IERC20(fromToken).universalApproveMax(approveTarget, fromTokenAmount);
        } else {
            // value check
            require(msg.value == fromTokenAmount, "invalid amount");
            toTokenOriginBalance = IERC20(_WETH_).universalBalanceOf(address(this));
        }
        {  
           (bool success, bytes memory result) = swapTarget.call{
                value: fromToken == _ETH_ADDRESS_ ? fromTokenAmount : 0
            }(callDataConcat);
            // revert with lowlevel info
            if (success == false) {
                assembly {
                    revert(add(result,32),mload(result))
                }
            }
        }
        // calculate toToken amount
        if(toToken != _ETH_ADDRESS_) {
            receiveAmount = IERC20(toToken).universalBalanceOf(address(this)) - (
                toTokenOriginBalance
            );
        } else {
            receiveAmount = IERC20(_WETH_).universalBalanceOf(address(this)) - (
                toTokenOriginBalance
            );
        }
        return receiveAmount;
    }

    function health() public pure returns(string memory){
        return "health";
    }

}