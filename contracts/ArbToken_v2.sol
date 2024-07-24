pragma solidity 0.5.13;

import "./ArbToken_v1.sol";

contract ArbToken_v2 is ArbToken_v1 {
    bytes32 private _NEW_DOMAIN_SEPARATOR;
    event UpdateMetadata(string _newName, string _newSymbol);

    function initializeV2(string memory _newName, string memory _newSymbol)
        public
    {
        require(_NEW_DOMAIN_SEPARATOR == 0x00, "V2 had initialized");
        setName(_newName);
        setSymbol(_newSymbol);

        uint256 id;
        assembly {id := chainid()}
        deploymentChainId = id;
        _NEW_DOMAIN_SEPARATOR = _calculateDomainSeparator(id);

        emit UpdateMetadata(_newName, _newSymbol);
    }

    function updateMetadata(string memory _newName, string memory _newSymbol)
        public
        onlyRescuer
    {
        setName(_newName);
        setSymbol(_newSymbol);

        uint256 id;
        assembly {id := chainid()}
        deploymentChainId = id;
        _NEW_DOMAIN_SEPARATOR = _calculateDomainSeparator(id);

        emit UpdateMetadata(_newName, _newSymbol);
    }

    function setName(string memory _newName) internal {
      name = _newName;
    }

    function setSymbol(string memory _newSymbol) internal {
      symbol = _newSymbol;
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        uint256 id;
        assembly {id := chainid()}
        return id == deploymentChainId ? _NEW_DOMAIN_SEPARATOR : _calculateDomainSeparator(id);
    }

    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(block.timestamp <= deadline, "permit expired");

        uint256 id;
        assembly {id := chainid()}

        bytes32 digest =
            keccak256(abi.encodePacked(
                "\x19\x01",
                id == deploymentChainId ? _NEW_DOMAIN_SEPARATOR : _calculateDomainSeparator(id),
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