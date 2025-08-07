//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
contract Log{
    uint a = 10;
    uint b = 20;
    function add( uint, uint) public view returns(uint){
        return(a+b);
    }
    uint c = add(a,b);
}