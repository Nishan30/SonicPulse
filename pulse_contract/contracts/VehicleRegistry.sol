// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Note: No more 'Counters' import
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VehicleRegistry
 * @dev Manages the registration of vehicles as NFTs and tracks their real-time state.
 * @notice This version is compatible with OpenZeppelin v5.0+
 */
contract VehicleRegistry is ERC721, Ownable {
    // --- CHANGE 1: Replace Counters with a simple uint256 ---
    // This is the new, recommended way to handle token IDs.
    uint256 private _nextTokenId;

    // A struct to hold the state of a vehicle.
    struct Vehicle {
        uint256 tokenId;
        string location;
        uint256 speed;
        uint256 lastUpdateTime;
    }

    // A mapping from the tokenId of the NFT to the vehicle's state.
    mapping(uint256 => Vehicle) public vehicleStates;

    /**
     * @dev Sets the name and symbol for the NFT collection.
     */
    constructor(address initialOwner) ERC721("SonicPulse Vehicle", "SPV") Ownable(initialOwner) {
        // --- CHANGE 2: Start token IDs from 1 ---
        // It's a common practice to avoid using tokenId 0.
        _nextTokenId = 1;
    }

    /**
     * @notice Registers a new vehicle, mints an NFT for it, and sets its initial state.
     * @param _owner The address that will own the new vehicle NFT.
     * @param _initialLocation The starting location of the vehicle.
     * @return The tokenId of the newly created vehicle NFT.
     */
    function registerVehicle(address _owner, string memory _initialLocation) public onlyOwner returns (uint256) {
        // --- CHANGE 3: Use our private variable for the new ID ---
        uint256 newItemId = _nextTokenId;
        _nextTokenId++; // Increment for the next registration

        // Mint the NFT with the new ID and assign it to the _owner.
        _safeMint(_owner, newItemId);

        // Create and store the initial state for the new vehicle.
        vehicleStates[newItemId] = Vehicle({
            tokenId: newItemId,
            location: _initialLocation,
            speed: 0,
            lastUpdateTime: block.timestamp
        });

        return newItemId;
    }

    /**
     * @notice Updates the state of an existing vehicle.
     * @dev Only the owner of the vehicle's NFT can call this function.
     * @param _tokenId The ID of the vehicle to update.
     * @param _newLocation The vehicle's new location.
     * @param _newSpeed The vehicle's new speed.
     */
    function updateVehicleState(uint256 _tokenId, string memory _newLocation, uint256 _newSpeed) public {
        require(ownerOf(_tokenId) == msg.sender, "Caller is not the owner of this vehicle");

        Vehicle storage vehicle = vehicleStates[_tokenId];
        vehicle.location = _newLocation;
        vehicle.speed = _newSpeed;
        vehicle.lastUpdateTime = block.timestamp;
    }

    /**
     * @notice A public view function for anyone to get a vehicle's state.
     * @param _tokenId The ID of the vehicle to query.
     * @return The Vehicle struct containing its current state.
     */
    function getVehicleState(uint256 _tokenId) public view returns (Vehicle memory) {
        return vehicleStates[_tokenId];
    }
}