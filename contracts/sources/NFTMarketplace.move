address 0x6f9a2e6e4ce45d5e338556f07eb3193cfbc74e4cbfcc097ea608dc02a44f883e {

    module NFTMarketplace {
        use 0x1::signer;
        use 0x1::vector;
        use 0x1::coin;
        use 0x1::aptos_coin;
        use 0x1::timestamp;

        // NFT Structure (removed for_sale and price fields)
        struct NFT has store, key {
            id: u64,
            owner: address,
            name: vector<u8>,
            description: vector<u8>,
            uri: vector<u8>,
            rarity: u8
        }

        // New ListedNFT Structure
        struct ListedNFT has store, drop, copy {
            nft_id: u64,
            owner: address,
            price: u64
        }

        // Updated Marketplace Structure
        struct Marketplace has key {
            nfts: vector<NFT>,
            listed_nfts: vector<ListedNFT>,
            auctions: vector<Auction>,
            offers: vector<Offer>,
            next_nft_id: u64
        }

        // Auction Structure (unchanged)
        struct Auction has store, drop {
            nft_id: u64,
            seller: address,
            start_price: u64,
            current_bid: u64,
            highest_bidder: address,
            end_time: u64,
            is_active: bool
        }

        // Offer Structure (unchanged)
        struct Offer has store, drop {
            nft_id: u64,
            buyer: address,
            price: u64,
            expiration_time: u64,
            is_active: bool
        }

        const MARKETPLACE_FEE_PERCENT: u64 = 2; // 2% fee

        // Updated initialize function
        public entry fun initialize(account: &signer) {
            let marketplace = Marketplace {
                nfts: vector::empty<NFT>(),
                listed_nfts: vector::empty<ListedNFT>(),
                auctions: vector::empty<Auction>(),
                offers: vector::empty<Offer>(),
                next_nft_id: 0
            };
            move_to(account, marketplace);
        }

        // Check Marketplace Initialization (unchanged)
        #[view]
        public fun is_marketplace_initialized(marketplace_addr: address): bool {
            exists<Marketplace>(marketplace_addr)
        }

        // Updated Mint New NFT function
        public entry fun mint_nft(account: &signer, marketplace_addr: address, name: vector<u8>, description: vector<u8>, uri: vector<u8>, rarity: u8) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let nft_id = marketplace.next_nft_id;
            marketplace.next_nft_id = nft_id + 1;

            let new_nft = NFT {
                id: nft_id,
                owner: signer::address_of(account),
                name,
                description,
                uri,
                rarity
            };

            vector::push_back(&mut marketplace.nfts, new_nft);
        }

        // Updated View NFT Details function
        #[view]
        public fun get_nft_details(marketplace_addr: address, nft_id: u64): (u64, address, vector<u8>, vector<u8>, vector<u8>, u8) acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let nft = vector::borrow(&marketplace.nfts, nft_id);

            (nft.id, nft.owner, nft.name, nft.description, nft.uri, nft.rarity)
        }

        // Updated List NFT for Sale function
        public entry fun list_for_sale(account: &signer, marketplace_addr: address, nft_id: u64, price: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let nft_ref = vector::borrow(&marketplace.nfts, nft_id);

            assert!(nft_ref.owner == signer::address_of(account), 100); // Caller is not the owner
            assert!(price > 0, 102); // Invalid price

            // Check if the NFT is already listed
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                assert!(listed_nft.nft_id != nft_id, 101); // NFT is already listed
                mut_i = mut_i + 1;
            };

            let listed_nft = ListedNFT {
                nft_id,
                owner: signer::address_of(account),
                price
            };

            vector::push_back(&mut marketplace.listed_nfts, listed_nft);
        }

        // New function to update listed NFT price
        public entry fun update_listed_nft_price(account: &signer, marketplace_addr: address, nft_id: u64, new_price: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow_mut(&mut marketplace.listed_nfts, mut_i);
                if (listed_nft.nft_id == nft_id) {
                    assert!(listed_nft.owner == signer::address_of(account), 200); // Caller is not the owner
                    assert!(new_price > 0, 201); // Invalid price
                    listed_nft.price = new_price;
                    return
                };
                mut_i = mut_i + 1;
            };
            abort 202; // NFT not found in the listed_nfts
        }

        // Updated Purchase NFT function
        public entry fun purchase_nft(account: &signer, marketplace_addr: address, nft_id: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            let (listed_nft_index, price) = (0, 0);
            let found = false;

            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                if (listed_nft.nft_id == nft_id) {
                    listed_nft_index = mut_i;
                    price = listed_nft.price;
                    found = true;
                    break
                };
                mut_i = mut_i + 1;
            };

            assert!(found, 400); // NFT is not listed for sale

            let listed_nft = vector::remove(&mut marketplace.listed_nfts, listed_nft_index);
            let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

            // Calculate marketplace fee
            let fee = (price * MARKETPLACE_FEE_PERCENT) / 100;
            let seller_revenue = price - fee;

            // Transfer payment to the seller and fee to the marketplace
            coin::transfer<aptos_coin::AptosCoin>(account, listed_nft.owner, seller_revenue);
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, fee);

            // Transfer ownership
            nft_ref.owner = signer::address_of(account);
        }

        // Updated Check if NFT is for Sale function
        #[view]
        public fun is_nft_for_sale(marketplace_addr: address, nft_id: u64): bool acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                if (listed_nft.nft_id == nft_id) {
                    return true
                };
                mut_i = mut_i + 1;
            };
            false
        }

        // Updated Get NFT Price function
        #[view]
        public fun get_nft_price(marketplace_addr: address, nft_id: u64): u64 acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                if (listed_nft.nft_id == nft_id) {
                    return listed_nft.price
                };
                mut_i = mut_i + 1;
            };
            0 // Return 0 if NFT is not found in the listed_nfts
        }

        // Updated Transfer Ownership function
        public entry fun transfer_ownership(account: &signer, marketplace_addr: address, nft_id: u64, new_owner: address) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

            assert!(nft_ref.owner == signer::address_of(account), 300); // Caller is not the owner
            assert!(nft_ref.owner != new_owner, 301); // Prevent transfer to the same owner

            // Remove from listed_nfts if it's listed
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                if (listed_nft.nft_id == nft_id) {
                    vector::remove(&mut marketplace.listed_nfts, mut_i);
                    break
                };
                mut_i = mut_i + 1;
            };

            // Update NFT ownership
            nft_ref.owner = new_owner;
        }

        // Retrieve NFT Owner (unchanged)
        #[view]
        public fun get_owner(marketplace_addr: address, nft_id: u64): address acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let nft = vector::borrow(&marketplace.nfts, nft_id);
            nft.owner
        }

        // Updated Retrieve NFTs for Owner function
        #[view]
        public fun get_all_nfts_for_owner(marketplace_addr: address, owner_addr: address, limit: u64, offset: u64): vector<u64> acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let nft_ids = vector::empty<u64>();

            let nfts_len = vector::length(&marketplace.nfts);
            let end = min(offset + limit, nfts_len);
            let mut_i = offset;
            while (mut_i < end) {
                let nft = vector::borrow(&marketplace.nfts, mut_i);
                if (nft.owner == owner_addr) {
                    vector::push_back(&mut nft_ids, nft.id);
                };
                mut_i = mut_i + 1;
            };

            nft_ids
        }

        // Updated Retrieve NFTs for Sale function
        #[view]
        public fun get_all_nfts_for_sale(marketplace_addr: address, limit: u64, offset: u64): vector<ListedNFT> acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let nfts_for_sale = vector::empty<ListedNFT>();

            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let end = min(offset + limit, listed_nfts_len);
            let mut_i = offset;
            while (mut_i < end) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                vector::push_back(&mut nfts_for_sale, *listed_nft);
                mut_i = mut_i + 1;
            };

            nfts_for_sale
        }

        // Helper function to find the minimum of two u64 numbers (unchanged)
        public fun min(a: u64, b: u64): u64 {
            if (a < b) { a } else { b }
        }

        // Retrieve NFTs by Rarity function
        #[view]
        public fun get_nfts_by_rarity(marketplace_addr: address, rarity: u8): vector<u64> acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let nft_ids = vector::empty<u64>();

            let nfts_len = vector::length(&marketplace.nfts);
            let mut_i = 0;
            while (mut_i < nfts_len) {
                let nft = vector::borrow(&marketplace.nfts, mut_i);
                if (nft.rarity == rarity) {
                    vector::push_back(&mut nft_ids, nft.id);
                };
                mut_i = mut_i + 1;
            };

            nft_ids
        }

        // Updated Create Auction function
        public entry fun create_auction(account: &signer, marketplace_addr: address, nft_id: u64, start_price: u64, duration: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let nft_ref = vector::borrow(&marketplace.nfts, nft_id);

            assert!(nft_ref.owner == signer::address_of(account), 500); // Caller is not the owner

            // Check if the NFT is already listed or in an active auction
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                assert!(listed_nft.nft_id != nft_id, 501); // NFT is already listed for sale
                mut_i = mut_i + 1;
            };

            let auctions_len = vector::length(&marketplace.auctions);
            let mut_i = 0;
            while (mut_i < auctions_len) {
                let auction = vector::borrow(&marketplace.auctions, mut_i);
                assert!(!auction.is_active || auction.nft_id != nft_id, 502); // NFT is already in an active auction
                mut_i = mut_i + 1;
            };

            let auction = Auction {
                nft_id,
                seller: signer::address_of(account),
                start_price,
                current_bid: start_price,
                highest_bidder: signer::address_of(account), // Initially, the seller is the highest bidder
                end_time: timestamp::now_seconds() + duration,
                is_active: true
            };

            vector::push_back(&mut marketplace.auctions, auction);
        }

        // Updated Place Bid function
        public entry fun place_bid(account: &signer, marketplace_addr: address, auction_index: u64, bid_amount: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let auction_ref = vector::borrow_mut(&mut marketplace.auctions, auction_index);

            assert!(auction_ref.is_active, 600); // Auction is not active
            assert!(timestamp::now_seconds() < auction_ref.end_time, 601); // Auction has ended
            assert!(bid_amount > auction_ref.current_bid, 602); // Bid is not higher than current bid

            // Refund the previous highest bidder
            if (auction_ref.highest_bidder != auction_ref.seller) {
                coin::transfer<aptos_coin::AptosCoin>(account, auction_ref.highest_bidder, auction_ref.current_bid);
            };

            // Update auction details
            auction_ref.current_bid = bid_amount;
            auction_ref.highest_bidder = signer::address_of(account);

            // Transfer the bid amount to the marketplace (to be held until auction ends)
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, bid_amount);
        }

        // Updated End Auction function
        public entry fun end_auction(account: &signer, marketplace_addr: address, auction_index: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let auction_ref = vector::borrow_mut(&mut marketplace.auctions, auction_index);

            assert!(auction_ref.is_active, 700); // Auction is not active
            assert!(timestamp::now_seconds() >= auction_ref.end_time, 701); // Auction has not ended yet

            let nft_ref = vector::borrow_mut(&mut marketplace.nfts, auction_ref.nft_id);

            // Transfer ownership of the NFT
            nft_ref.owner = auction_ref.highest_bidder;

            // Calculate and transfer funds
            let fee = (auction_ref.current_bid * MARKETPLACE_FEE_PERCENT) / 100;
            let seller_revenue = auction_ref.current_bid - fee;

            coin::transfer<aptos_coin::AptosCoin>(account, auction_ref.seller, seller_revenue);
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, fee);

            // Close the auction
            auction_ref.is_active = false;
        }

        // Updated Create Offer function
        public entry fun create_offer(account: &signer, marketplace_addr: address, nft_id: u64, offer_price: u64, duration: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let nft_ref = vector::borrow(&marketplace.nfts, nft_id);

            assert!(nft_ref.owner != signer::address_of(account), 800); // Cannot make an offer on your own NFT
            assert!(offer_price > 0, 801); // Invalid offer price

            let offer = Offer {
                nft_id,
                buyer: signer::address_of(account),
                price: offer_price,
                expiration_time: timestamp::now_seconds() + duration,
                is_active: true
            };

            vector::push_back(&mut marketplace.offers, offer);

            // Transfer the offer amount to the marketplace (to be held until offer is accepted or expires)
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, offer_price);
        }

        // Updated Accept Offer function
        public entry fun accept_offer(account: &signer, marketplace_addr: address, offer_index: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let offer_ref = vector::borrow_mut(&mut marketplace.offers, offer_index);

            assert!(offer_ref.is_active, 900); // Offer is not active
            assert!(timestamp::now_seconds() < offer_ref.expiration_time, 901); // Offer has expired

            let nft_ref = vector::borrow_mut(&mut marketplace.nfts, offer_ref.nft_id);
            assert!(nft_ref.owner == signer::address_of(account), 902); // Caller is not the owner of the NFT

            // Remove from listed_nfts if it's listed
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                if (listed_nft.nft_id == offer_ref.nft_id) {
                    vector::remove(&mut marketplace.listed_nfts, mut_i);
                    break
                };
                mut_i = mut_i + 1;
            };

            // Transfer ownership of the NFT
            nft_ref.owner = offer_ref.buyer;

            // Calculate and transfer funds
            let fee = (offer_ref.price * MARKETPLACE_FEE_PERCENT) / 100;
            let seller_revenue = offer_ref.price - fee;

            coin::transfer<aptos_coin::AptosCoin>(account, signer::address_of(account), seller_revenue);
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, fee);

            // Close the offer
            offer_ref.is_active = false;
        }

        // Updated Cancel Offer function
        public entry fun cancel_offer(account: &signer, marketplace_addr: address, offer_index: u64) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            let offer_ref = vector::borrow_mut(&mut marketplace.offers, offer_index);

            assert!(offer_ref.is_active, 1000); // Offer is not active
            assert!(offer_ref.buyer == signer::address_of(account), 1001); // Caller is not the offer creator

            // Refund the offer amount to the buyer
            coin::transfer<aptos_coin::AptosCoin>(account, offer_ref.buyer, offer_ref.price);

            // Close the offer
            offer_ref.is_active = false;
        }

        // Get Auction Details function (unchanged)
        #[view]
        public fun get_auction_details(marketplace_addr: address, auction_index: u64): (u64, address, u64, u64, address, u64, bool) acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let auction = vector::borrow(&marketplace.auctions, auction_index);

            (auction.nft_id, auction.seller, auction.start_price, auction.current_bid, auction.highest_bidder, auction.end_time, auction.is_active)
        }

        // Get Offer Details function (unchanged)
        #[view]
        public fun get_offer_details(marketplace_addr: address, offer_index: u64): (u64, address, u64, u64, bool) acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let offer = vector::borrow(&marketplace.offers, offer_index);

            (offer.nft_id, offer.buyer, offer.price, offer.expiration_time, offer.is_active)
        }
    }
}

