// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DesalesNFT.sol";

contract Auction is Ownable {
	address public dnftAddress;


	function setDnftAddress(address _dnftAddress) external onlyOwner {
		dnftAddress = _dnftAddress;
	}

    constructor(address _dnftAddress) Ownable(msg.sender)  {
        dnftAddress = _dnftAddress;
    }

	struct AuctionInfo {
		address seller;
		address stablecoin;
		uint256 startTime;
		uint256 endTime;
		uint256 startPrice;
		address highestBidder;
		uint256 highestBid;
		uint256 tokenId;
		address tokenContract;
		bool withdrawn;
		bool claimed;
		bool preventSniping;
		// uint256 timestamp;
	}

	uint256 public auctionCount;
	mapping(uint256 => AuctionInfo) public auctions;

	function getAuction(
		uint256 _auctionId
	) external view returns (AuctionInfo memory) {
		return auctions[_auctionId];
	}

	function getRecentAuctions(
		uint256 _count
	) external view returns (AuctionInfo[] memory) {
		if (_count > auctionCount) {
			_count = auctionCount;
		}
		AuctionInfo[] memory _auctions = new AuctionInfo[](_count);
		//get the most recent auctions, latest first
		for (uint256 i = 0; i < _count; i++) {
			_auctions[i] = auctions[auctionCount - i];
		}
		return _auctions;
	}

	event AuctionCreated(
		uint256 indexed auctionId,
		address indexed seller,
		address indexed stablecoin,
		uint256 tokenId,
		address tokenContract,
		string tokenURI,
		uint256 endTime,
		uint256 startTime,
		uint256 startPrice,
		bool preventSniping,
		uint256 timestamp
	);

	event Withdrawal(
		uint256 indexed auctionId,
		address indexed bidder,
		uint256 amount
	);

	event Claimed(
		uint256 indexed auctionId,
		address indexed bidder,
		uint256 amount
	);

	event BidPlaced(
		uint256 indexed auctionId,
		address indexed bidder,
		uint256 amount,
		uint256 timestamp,
		uint256 newEndTime
	);

	modifier onlyAuctionOpen(uint256 _auctionId) {
		require(
			auctions[_auctionId].startTime <= block.timestamp,
			"Auction is not open"
		);
		_;
	}

	modifier onlyAuctionEnded(uint256 _auctionId) {
		require(
			auctions[_auctionId].endTime <= block.timestamp,
			"Auction has not ended yet"
		);
		_;
	}

	function createAuction(
		address _stablecoin,
		uint256 _startTime,
		uint256 _endTime,
		uint256 _startPrice,
		string memory tokenURI,
		bool _preventSniping
	) external returns (uint256) {
		require(_endTime > block.timestamp, "End time must be in the future");
		require(_endTime > _startTime, "End time must be after start time");
		require(_startPrice > 0, "Start price must be greater than 0");

		// require( IERC721(_tokenContract).isApprovedForAll(msg.sender, address(this)), "Contract not approved to transfer NFT");



		uint256 _tokenId = DesalesNFT(dnftAddress).mint(tokenURI);

		 auctionCount = auctionCount + 1;

		
			auctions[auctionCount].seller = msg.sender;
			auctions[auctionCount].stablecoin = _stablecoin;
			auctions[auctionCount].startTime = _startTime;
			auctions[auctionCount].endTime = _endTime;
			auctions[auctionCount].highestBidder = address(0);
			auctions[auctionCount].highestBid = 0;
			auctions[auctionCount].startPrice = _startPrice;
			auctions[auctionCount].tokenId = _tokenId;
			auctions[auctionCount].tokenContract = dnftAddress;
			auctions[auctionCount].withdrawn = false;
			auctions[auctionCount].claimed = false;
			auctions[auctionCount].preventSniping = _preventSniping;
			// auctions[++auctionCount].timestamp = block.timestamp;
	

		emit AuctionCreated(
			auctionCount,
			msg.sender,
			_stablecoin,
			_tokenId,
			dnftAddress,
			tokenURI,
			_endTime,
			_startTime,
			_startPrice,
			_preventSniping,
			block.timestamp
		);
		return auctionCount;
	}

	// function startAuction(uint256 _auctionId) external onlyOwner {
	//     AuctionInfo storage auction = auctions[_auctionId];
	//     require(auction.starTime > block.timestamp, "Auction already started");
	//     auction.startTime = block.timestamp;
	// }

	function placeBid(
		uint256 _auctionId,
		uint256 _amount
	) external onlyAuctionOpen(_auctionId) {
		AuctionInfo storage auction = auctions[_auctionId];
		require(
			_amount > auction.highestBid,
			"Bid must be higher than the current highest bid"
		);
		require(
			IERC20(auction.stablecoin).transferFrom(msg.sender, address(this), _amount),
			"Transfer failed"
		);

		// Refund the previous highest bidder
		if (auction.highestBidder != address(0)) {
			IERC20(auction.stablecoin).transfer(
				auction.highestBidder,
				auction.highestBid
			);
		}

		uint256 newEndtime = auction.endTime;
		if (auction.preventSniping) {
			//increase endTime if bid was placed in last 10 minutes
			if (auction.endTime - block.timestamp < 600) {
				newEndtime = auction.endTime = auction.endTime+ 600;
			}
		}

		auction.highestBidder = msg.sender;
		auction.highestBid = _amount;

		emit BidPlaced(
			_auctionId,
			msg.sender,
			_amount,
			block.timestamp,
			newEndtime
		);
	}

	function claim(uint256 _auctionId) external onlyAuctionEnded(_auctionId) {
		AuctionInfo storage auction = auctions[_auctionId];
		require(
			auction.highestBidder == msg.sender,
			"Only the highest bidder can claim"
		);

		// Transfer the NFT to the highest bidder
		IERC721(auction.tokenContract).safeTransferFrom(
			address(this),
			auction.highestBidder,
			auction.tokenId
		);
		auction.claimed = true;
		emit Claimed(_auctionId, msg.sender, auction.highestBid);
	}

	function withdraw(
		uint256 _auctionId
	) external onlyAuctionEnded(_auctionId) {
		AuctionInfo storage auction = auctions[_auctionId];
		require(!auction.withdrawn, "Funds already withdrawn");
		IERC20(auction.stablecoin).transfer(msg.sender, auction.highestBid);
		auction.withdrawn = true;
		emit Withdrawal(_auctionId, msg.sender, auction.highestBid);
	}
}