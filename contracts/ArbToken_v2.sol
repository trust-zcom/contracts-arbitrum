pragma solidity 0.5.13;

import "./ArbToken_v1.sol";

contract ArbToken_v2 is ArbToken_v1 {
    bool private initializedV2 = false;
    event UpdateMetadata(string indexed _newName, string indexed _newSymbol);

    function initializeV2(string memory _newName, string memory _newSymbol)
        public
    {
        require(!initializedV2, "V2 had initialized");
        setName(_newName);
        setSymbol(_newSymbol);
        initializedV2 = true;
        emit UpdateMetadata(_newName, _newSymbol);
    }

    function updateMetadata(string memory _newName, string memory _newSymbol)
        public
        onlyRescuer
    {
        setName(_newName);
        setSymbol(_newSymbol);

        emit UpdateMetadata(_newName, _newSymbol);
    }

    function setName(string memory _newName) internal {
      name = _newName;
    }

    function setSymbol(string memory _newSymbol) internal {
      symbol = _newSymbol;
    }


    function _calculateDomainSeparator(uint256 chainId) private view returns (bytes32) {
        return keccak256(
            abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name)),
            keccak256(bytes(version)),
            chainId,
            address(this)
            )
        );
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        uint256 id;
        assembly {id := chainid()}
        return _calculateDomainSeparator(id);
    }

    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(block.timestamp <= deadline, "permit expired");

        uint256 id;
        assembly {id := chainid()}

        bytes32 digest =
            keccak256(abi.encodePacked(
                "\x19\x01",
                _calculateDomainSeparator(id),
                keccak256(abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonces[owner]++,
                deadline
                ))
            ));

        require(owner != address(0) && owner == ecrecover(digest, v, r, s), "invalid permit");

        _approve(owner, spender, value);
    }
}