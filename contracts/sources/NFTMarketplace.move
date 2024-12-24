// contracts\sources\NFTMarketplace.move
address 0x388ed434f0223624dba110cd117d7b99ce6ab55fe975bbd04c0b4f02184bde3f {
    module NFTMarketplace {
        use 0x1::signer;
        use 0x1::vector;
        use 0x1::coin;
        use 0x1::aptos_coin;
        use 0x1::timestamp;

        // Error codes
        const ENOT_OWNER: u64 = 100;
        const ENFT_ALREADY_LISTED: u64 = 101;
        const EINVALID_PRICE: u64 = 102;
        const ENFT_NOT_FOUND: u64 = 103;
        const ENFT_NOT_FOR_SALE: u64 = 104;
        const EAUCTION_NOT_ACTIVE: u64 = 105;
        const EAUCTION_ENDED: u64 = 106;
        const EBID_TOO_LOW: u64 = 107;
        const ESELLER_CANNOT_BID: u64 = 108;
        const EOFFER_NOT_ACTIVE: u64 = 109;
        const EOFFER_EXPIRED: u64 = 110;
        const ENFT_IN_AUCTION: u64 = 111;
        const ENFT_HAS_OFFERS: u64 = 112;
        const EINVALID_AUCTION: u64 = 113;
        const EINVALID_OFFER: u64 = 114;
        const ENOT_LISTED: u64 = 115;
        const EAUCTION_EXISTS: u64 = 116;
        const EOFFER_EXISTS: u64 = 117;
        const EINVALID_NFT_ID: u64 = 118;
        const EALREADY_LISTED: u64 = 119;
        const EINVALID_DURATION: u64 = 120;

        // Constants
        const MARKETPLACE_FEE_PERCENT: u64 = 2; // 2% fee

        // NFT Structure
        struct NFT has store, key {
            id: u64,
            owner: address,
            name: vector<u8>,
            description: vector<u8>,
            uri: vector<u8>,
            rarity: u8
        }

        // Listed NFT Structure
        struct ListedNFT has store, drop, copy {
            nft_id: u64,
            owner: address,
            price: u64
        }

        // Auction Structure
        struct Auction has store, drop, copy {
            nft_id: u64,
            seller: address,
            start_price: u64,
            current_bid: u64,
            highest_bidder: address,
            end_time: u64,
            is_active: bool
        }

        // Offer Structure
        struct Offer has store, drop, copy {
            nft_id: u64,
            buyer: address,
            price: u64,
            expiration_time: u64,
            is_active: bool
        }

        // Marketplace Structure
        struct Marketplace has key {
            nfts: vector<NFT>,
            listed_nfts: vector<ListedNFT>,
            auctions: vector<Auction>,
            offers: vector<Offer>,
            next_nft_id: u64
        }

        // Initialize function
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

        // Mint NFT function
        public entry fun mint_nft(
            account: &signer,
            marketplace_addr: address,
            name: vector<u8>,
            description: vector<u8>,
            uri: vector<u8>,
            rarity: u8
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            let nft = NFT {
                id: marketplace.next_nft_id,
                owner: signer::address_of(account),
                name,
                description,
                uri,
                rarity
            };
            
            vector::push_back(&mut marketplace.nfts, nft);
            marketplace.next_nft_id = marketplace.next_nft_id + 1;
        }

        // List NFT for sale
        public entry fun list_for_sale(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64,
            price: u64
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Verify NFT exists and caller is owner
            assert!(nft_id < vector::length(&marketplace.nfts), EINVALID_NFT_ID);
            let nft = vector::borrow(&marketplace.nfts, nft_id);
            assert!(nft.owner == signer::address_of(account), ENOT_OWNER);
            assert!(price > 0, EINVALID_PRICE);
            
            // Check NFT is not already listed or in auction
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                assert!(listed_nft.nft_id != nft_id, EALREADY_LISTED);
                mut_i = mut_i + 1;
            };
            
            // Check not in auction
            let auctions_len = vector::length(&marketplace.auctions);
            let mut_i = 0;
            while (mut_i < auctions_len) {
                let auction = vector::borrow(&marketplace.auctions, mut_i);
                assert!(!(auction.nft_id == nft_id && auction.is_active), ENFT_IN_AUCTION);
                mut_i = mut_i + 1;
            };
            
            let listed_nft = ListedNFT {
                nft_id,
                owner: signer::address_of(account),
                price
            };
            
            vector::push_back(&mut marketplace.listed_nfts, listed_nft);
        }

        // Purchase listed NFT
        public entry fun purchase_nft(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Find and validate listing
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            let listed_nft_index = 0;
            let found = false;
            
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                if (listed_nft.nft_id == nft_id) {
                    listed_nft_index = mut_i;
                    found = true;
                    break
                };
                mut_i = mut_i + 1;
            };
            
            assert!(found, ENOT_LISTED);
            
            let listed_nft = vector::borrow(&marketplace.listed_nfts, listed_nft_index);
            let price = listed_nft.price;
            
            // Calculate fees
            let fee = (price * MARKETPLACE_FEE_PERCENT) / 100;
            let seller_amount = price - fee;
            
            // Transfer payments
            coin::transfer<aptos_coin::AptosCoin>(account, listed_nft.owner, seller_amount);
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, fee);
            
            // Update NFT ownership
            let nft = vector::borrow_mut(&mut marketplace.nfts, nft_id);
            nft.owner = signer::address_of(account);
            
            // Remove listing
            vector::remove(&mut marketplace.listed_nfts, listed_nft_index);
        }

        // Create auction
        public entry fun create_auction(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64,
            start_price: u64,
            duration: u64
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Verify NFT exists and caller is owner
            assert!(nft_id < vector::length(&marketplace.nfts), EINVALID_NFT_ID);
            let nft = vector::borrow(&marketplace.nfts, nft_id);
            assert!(nft.owner == signer::address_of(account), ENOT_OWNER);
            assert!(start_price > 0, EINVALID_PRICE);
            assert!(duration > 0, EINVALID_DURATION);
            
            // Check NFT is not already in auction or listed
            let auctions_len = vector::length(&marketplace.auctions);
            let mut_i = 0;
            while (mut_i < auctions_len) {
                let auction = vector::borrow(&marketplace.auctions, mut_i);
                assert!(!(auction.nft_id == nft_id && auction.is_active), EAUCTION_EXISTS);
                mut_i = mut_i + 1;
            };
            
            // Check not listed
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                assert!(listed_nft.nft_id != nft_id, EALREADY_LISTED);
                mut_i = mut_i + 1;
            };
            
            let auction = Auction {
                nft_id,
                seller: signer::address_of(account),
                start_price,
                current_bid: start_price,
                highest_bidder: signer::address_of(account),
                end_time: timestamp::now_seconds() + duration,
                is_active: true
            };
            
            vector::push_back(&mut marketplace.auctions, auction);
        }

        // Place bid
        public entry fun place_bid(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64,
            bid_amount: u64
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Find the auction for this NFT
            let auctions_len = vector::length(&marketplace.auctions);
            let mut_i = 0;
            let auction_ref = 0;
            let found = false;
            
            while (mut_i < auctions_len) {
                let auction = vector::borrow(&marketplace.auctions, mut_i);
                if (auction.nft_id == nft_id && auction.is_active) {
                    auction_ref = mut_i;
                    found = true;
                    break
                };
                mut_i = mut_i + 1;
            };
            
            assert!(found, ENFT_NOT_FOUND);
            
            let auction = vector::borrow_mut(&mut marketplace.auctions, auction_ref);
            
            // Validations
            assert!(auction.is_active, EAUCTION_NOT_ACTIVE);
            assert!(timestamp::now_seconds() < auction.end_time, EAUCTION_ENDED);
            assert!(bid_amount > auction.current_bid, EBID_TOO_LOW);
            assert!(signer::address_of(account) != auction.seller, ESELLER_CANNOT_BID);
            
            // Transfer the new bid
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, bid_amount);
            
            // Refund previous bidder if exists
            if (auction.highest_bidder != auction.seller) {
                coin::transfer<aptos_coin::AptosCoin>(account, auction.highest_bidder, auction.current_bid);
            };
            
            // Update auction
            auction.current_bid = bid_amount;
            auction.highest_bidder = signer::address_of(account);
        }

        // End auction
        public entry fun end_auction(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Find the auction
            let auctions_len = vector::length(&marketplace.auctions);
            let mut_i = 0;
            let auction_ref = 0;
            let found = false;
            
            while (mut_i < auctions_len) {
                let auction = vector::borrow(&marketplace.auctions, mut_i);
                if (auction.nft_id == nft_id && auction.is_active) {
                    auction_ref = mut_i;
                    found = true;
                    break
                };
                mut_i = mut_i + 1;
            };
            
            assert!(found, EINVALID_AUCTION);
            
            let auction = vector::borrow_mut(&mut marketplace.auctions, auction_ref);
            assert!(timestamp::now_seconds() >= auction.end_time, EAUCTION_NOT_ACTIVE);
            
            // Calculate fees
            let fee = (auction.current_bid * MARKETPLACE_FEE_PERCENT) / 100;
            let seller_amount = auction.current_bid - fee;
            
            // Transfer payments
            coin::transfer<aptos_coin::AptosCoin>(account, auction.seller, seller_amount);
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, fee);
            
            // Update NFT ownership
            let nft = vector::borrow_mut(&mut marketplace.nfts, nft_id);
            nft.owner = auction.highest_bidder;
            
            // Close auction
            auction.is_active = false;
        }

        // Create offer
        public entry fun create_offer(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64,
            price: u64,
            duration: u64
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Verify NFT exists
            assert!(nft_id < vector::length(&marketplace.nfts), EINVALID_NFT_ID);
            let nft = vector::borrow(&marketplace.nfts, nft_id);
            
            // Verify caller is not the owner
            assert!(nft.owner != signer::address_of(account), ENOT_OWNER);
            assert!(price > 0, EINVALID_PRICE);
            assert!(duration > 0, EINVALID_DURATION);
            
            // Check if offer already exists
            let offers_len = vector::length(&marketplace.offers);
            let mut_i = 0;
            while (mut_i < offers_len) {
                let offer = vector::borrow(&marketplace.offers, mut_i);
                assert!(!(offer.nft_id == nft_id && 
                       offer.buyer == signer::address_of(account) && 
                       offer.is_active), EOFFER_EXISTS);
                mut_i = mut_i + 1;
            };
            
            // Create and add offer
            let offer = Offer {
                nft_id,
                buyer: signer::address_of(account),
                price,
                expiration_time: timestamp::now_seconds() + duration,
                is_active: true
            };
            
            // Transfer offer amount to marketplace
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, price);
            
            vector::push_back(&mut marketplace.offers, offer);
        }

        // Accept offer
        public entry fun accept_offer(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64,
            buyer: address
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Find and validate offer
            let offers_len = vector::length(&marketplace.offers);
            let mut_i = 0;
            let offer_index = 0;
            let found = false;
            
            while (mut_i < offers_len) {
                let offer = vector::borrow(&marketplace.offers, mut_i);
                if (offer.nft_id == nft_id && 
                    offer.buyer == buyer && 
                    offer.is_active) {
                    offer_index = mut_i;
                    found = true;
                    break
                };
                mut_i = mut_i + 1;
            };
            
            assert!(found, EINVALID_OFFER);
            
            let offer = vector::borrow_mut(&mut marketplace.offers, offer_index);
            assert!(timestamp::now_seconds() < offer.expiration_time, EOFFER_EXPIRED);
            
            // Verify NFT ownership
            let nft = vector::borrow_mut(&mut marketplace.nfts, nft_id);
            assert!(nft.owner == signer::address_of(account), ENOT_OWNER);
            
            // Calculate fees
            let fee = (offer.price * MARKETPLACE_FEE_PERCENT) / 100;
            let seller_amount = offer.price - fee;
            
            // Transfer payments
            coin::transfer<aptos_coin::AptosCoin>(account, signer::address_of(account), seller_amount);
            coin::transfer<aptos_coin::AptosCoin>(account, marketplace_addr, fee);
            
            // Update NFT ownership
            nft.owner = offer.buyer;
            
            // Deactivate offer
            offer.is_active = false;
        }

        // Cancel offer
        public entry fun cancel_offer(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Find and validate offer
            let offers_len = vector::length(&marketplace.offers);
            let mut_i = 0;
            let offer_index = 0;
            let found = false;
            
            while (mut_i < offers_len) {
                let offer = vector::borrow(&marketplace.offers, mut_i);
                if (offer.nft_id == nft_id && 
                    offer.buyer == signer::address_of(account) && 
                    offer.is_active) {
                    offer_index = mut_i;
                    found = true;
                    break
                };
                mut_i = mut_i + 1;
            };
            
            assert!(found, EINVALID_OFFER);
            
            let offer = vector::borrow_mut(&mut marketplace.offers, offer_index);
            
            // Refund offer amount
            coin::transfer<aptos_coin::AptosCoin>(account, offer.buyer, offer.price);
            
            // Deactivate offer
            offer.is_active = false;
        }

        // Transfer NFT ownership
        public entry fun transfer_ownership(
            account: &signer,
            marketplace_addr: address,
            nft_id: u64,
            recipient: address
        ) acquires Marketplace {
            let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
            
            // Verify NFT exists and caller is owner
            assert!(nft_id < vector::length(&marketplace.nfts), EINVALID_NFT_ID);
            let nft = vector::borrow_mut(&mut marketplace.nfts, nft_id);
            assert!(nft.owner == signer::address_of(account), ENOT_OWNER);
            
            // Check NFT is not listed for sale
            let listed_nfts_len = vector::length(&marketplace.listed_nfts);
            let mut_i = 0;
            while (mut_i < listed_nfts_len) {
                let listed_nft = vector::borrow(&marketplace.listed_nfts, mut_i);
                assert!(listed_nft.nft_id != nft_id, EALREADY_LISTED);
                mut_i = mut_i + 1;
            };
            
            // Check NFT is not in auction
            let auctions_len = vector::length(&marketplace.auctions);
            let mut_i = 0;
            while (mut_i < auctions_len) {
                let auction = vector::borrow(&marketplace.auctions, mut_i);
                assert!(!(auction.nft_id == nft_id && auction.is_active), ENFT_IN_AUCTION);
                mut_i = mut_i + 1;
            };
            
            // Check NFT has no active offers
            let offers_len = vector::length(&marketplace.offers);
            let mut_i = 0;
            while (mut_i < offers_len) {
                let offer = vector::borrow(&marketplace.offers, mut_i);
                assert!(!(offer.nft_id == nft_id && offer.is_active), ENFT_HAS_OFFERS);
                mut_i = mut_i + 1;
            };
            
            // Update ownership
            nft.owner = recipient;
        }

        // View functions
        #[view]
        public fun get_nft_details(marketplace_addr: address, nft_id: u64): (u64, address, vector<u8>, vector<u8>, vector<u8>, u8) acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            assert!(nft_id < vector::length(&marketplace.nfts), EINVALID_NFT_ID);
            
            let nft = vector::borrow(&marketplace.nfts, nft_id);
            (nft.id, nft.owner, nft.name, nft.description, nft.uri, nft.rarity)
        }

        #[view]
        public fun get_auction_details(marketplace_addr: address, nft_id: u64): (address, u64, u64, address, u64, bool) acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            
            let auctions_len = vector::length(&marketplace.auctions);
            let mut_i = 0;
            
            while (mut_i < auctions_len) {
                let auction = vector::borrow(&marketplace.auctions, mut_i);
                if (auction.nft_id == nft_id && auction.is_active) {
                    return (
                        auction.seller,
                        auction.start_price,
                        auction.current_bid,
                        auction.highest_bidder,
                        auction.end_time,
                        auction.is_active
                    )
                };
                mut_i = mut_i + 1;
            };
            
            abort EINVALID_AUCTION
        }

        #[view]
        public fun get_offer_details(marketplace_addr: address, nft_id: u64, buyer: address): (u64, u64, bool) acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            
            let offers_len = vector::length(&marketplace.offers);
            let mut_i = 0;
            
            while (mut_i < offers_len) {
                let offer = vector::borrow(&marketplace.offers, mut_i);
                if (offer.nft_id == nft_id && offer.buyer == buyer) {
                    return (
                        offer.price,
                        offer.expiration_time,
                        offer.is_active
                    )
                };
                mut_i = mut_i + 1;
            };
            
            abort EINVALID_OFFER
        }

        #[view]
        public fun get_available_nfts(marketplace_addr: address): vector<u64> acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let available_nfts = vector::empty<u64>();
            
            let nfts_len = vector::length(&marketplace.nfts);
            let mut_i = 0;
            
            while (mut_i < nfts_len) {
                let nft = vector::borrow(&marketplace.nfts, mut_i);
                let nft_id = nft.id;
                
                // Check if NFT is not listed for sale
                let is_listed = false;
                let listed_len = vector::length(&marketplace.listed_nfts);
                let mut_j = 0;
                while (mut_j < listed_len) {
                    let listed = vector::borrow(&marketplace.listed_nfts, mut_j);
                    if (listed.nft_id == nft_id) {
                        is_listed = true;
                        break
                    };
                    mut_j = mut_j + 1;
                };
                
                // Check if NFT is not in auction
                let in_auction = false;
                let auctions_len = vector::length(&marketplace.auctions);
                let mut_j = 0;
                while (mut_j < auctions_len) {
                    let auction = vector::borrow(&marketplace.auctions, mut_j);
                    if (auction.nft_id == nft_id && auction.is_active) {
                        in_auction = true;
                        break
                    };
                    mut_j = mut_j + 1;
                };
                
                if (!is_listed && !in_auction) {
                    vector::push_back(&mut available_nfts, nft_id);
                };
                
                mut_i = mut_i + 1;
            };
            
            available_nfts
        }

        #[view]
        public fun get_user_auction_nfts(marketplace_addr: address, user_addr: address): vector<u64> acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let auction_nfts = vector::empty<u64>();
            
            let auctions_len = vector::length(&marketplace.auctions);
            let mut_i = 0;
            
            while (mut_i < auctions_len) {
                let auction = vector::borrow(&marketplace.auctions, mut_i);
                if (auction.seller == user_addr && auction.is_active) {
                    vector::push_back(&mut auction_nfts, auction.nft_id);
                };
                mut_i = mut_i + 1;
            };
            
            auction_nfts
        }

        #[view]
        public fun get_incoming_offers(marketplace_addr: address, user_addr: address): vector<u64> acquires Marketplace {
            let marketplace = borrow_global<Marketplace>(marketplace_addr);
            let offer_nfts = vector::empty<u64>();
            
            let offers_len = vector::length(&marketplace.offers);
            let mut_i = 0;
            
            while (mut_i < offers_len) {
                let offer = vector::borrow(&marketplace.offers, mut_i);
                if (offer.is_active) {
                    let nft = vector::borrow(&marketplace.nfts, offer.nft_id);
                    if (nft.owner == user_addr) {
                        vector::push_back(&mut offer_nfts, offer.nft_id);
                    };
                };
                mut_i = mut_i + 1;
            };
            
            offer_nfts
        }

        // Helper functions
        fun min(a: u64, b: u64): u64 {
            if (a < b) { a } else { b }
        }
    }
}

