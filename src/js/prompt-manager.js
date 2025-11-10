// Prompt Manager - Handles all Would You Rather prompts
class PromptManager {
    constructor() {
        this.defaultPrompts = [
            // Classic Choices (1-20)
            ['Pizza', 'Burger'],
            ['Coffee', 'Tea'],
            ['Beach', 'Mountains'],
            ['Summer', 'Winter'],
            ['Dog', 'Cat'],
            ['Books', 'Movies'],
            ['Morning', 'Night'],
            ['City', 'Countryside'],
            ['Swimming', 'Hiking'],
            ['Chocolate', 'Vanilla'],
            ['Flying', 'Invisibility'],
            ['Past', 'Future'],
            ['Rich', 'Famous'],
            ['Hot', 'Cold'],
            ['Sweet', 'Salty'],
            ['Netflix', 'Cinema'],
            ['Early Bird', 'Night Owl'],
            ['Travel', 'Staycation'],
            ['Android', 'iPhone'],
            ['Reading', 'Writing'],

            // Technology & Social Media (21-50)
            ['Instagram', 'TikTok'],
            ['YouTube', 'Twitch'],
            ['Twitter', 'Threads'],
            ['PlayStation', 'Xbox'],
            ['Gaming PC', 'Gaming Console'],
            ['Wireless Earbuds', 'Wired Headphones'],
            ['Smart Watch', 'Traditional Watch'],
            ['Laptop', 'Desktop'],
            ['Mac', 'Windows'],
            ['Alexa', 'Google Assistant'],
            ['Virtual Reality', 'Augmented Reality'],
            ['Electric Car', 'Gas Car'],
            ['Self-Driving Car', 'Manual Car'],
            ['Smartphone', 'Flip Phone'],
            ['Tablet', 'E-Reader'],
            ['Streaming Music', 'Vinyl Records'],
            ['Smart Home', 'Traditional Home'],
            ['Online Shopping', 'In-Store Shopping'],
            ['Video Call', 'Phone Call'],
            ['Text Message', 'Voice Message'],
            ['Dark Mode', 'Light Mode'],
            ['GIF', 'Emoji'],
            ['Meme', 'Video'],
            ['Podcast', 'Audiobook'],
            ['AI Assistant', 'Human Assistant'],
            ['Cryptocurrency', 'Traditional Currency'],
            ['NFT', 'Physical Art'],
            ['Cloud Storage', 'External Hard Drive'],
            ['Wireless Charging', 'Cable Charging'],
            ['5G', '4G with Unlimited Data'],

            // Food & Drinks (51-80)
            ['Tacos', 'Burritos'],
            ['Sushi', 'Ramen'],
            ['Pasta', 'Rice'],
            ['Ice Cream', 'Frozen Yogurt'],
            ['Donuts', 'Cookies'],
            ['Cake', 'Pie'],
            ['Chips', 'Popcorn'],
            ['Steak', 'Chicken'],
            ['Breakfast for Dinner', 'Dinner for Breakfast'],
            ['Pancakes', 'Waffles'],
            ['Smoothie', 'Milkshake'],
            ['Energy Drink', 'Coffee'],
            ['Water', 'Juice'],
            ['Wine', 'Beer'],
            ['Cocktails', 'Mocktails'],
            ['Spicy Food', 'Mild Food'],
            ['Asian Cuisine', 'Italian Cuisine'],
            ['Fast Food', 'Home Cooked Meal'],
            ['Buffet', 'Fine Dining'],
            ['Cereal', 'Toast'],
            ['Salad', 'Soup'],
            ['Sandwich', 'Wrap'],
            ['Hot Dog', 'Hamburger'],
            ['French Fries', 'Onion Rings'],
            ['Ketchup', 'Mustard'],
            ['Mayo', 'Sriracha'],
            ['Peanut Butter', 'Nutella'],
            ['Fresh Juice', 'Bottled Juice'],
            ['Boba Tea', 'Regular Tea'],
            ['Cheese', 'No Cheese'],

            // Superpowers & Abilities (81-110)
            ['Time Travel', 'Teleportation'],
            ['Mind Reading', 'Mind Control'],
            ['Super Strength', 'Super Speed'],
            ['Shapeshifting', 'Telekinesis'],
            ['Healing Powers', 'Immortality'],
            ['Control Fire', 'Control Water'],
            ['Control Weather', 'Control Animals'],
            ['X-Ray Vision', 'Night Vision'],
            ['Talk to Animals', 'Talk to Plants'],
            ['Never Sleep', 'Never Eat'],
            ['Photographic Memory', 'Perfect Recall'],
            ['Super Intelligence', 'Super Charisma'],
            ['Breathe Underwater', 'Survive in Space'],
            ['Control Technology', 'Control Minds'],
            ['See the Future', 'Change the Past'],
            ['Be a Wizard', 'Be a Superhero'],
            ['Have Dragon', 'Have Phoenix'],
            ['Alchemy', 'Magic'],
            ['Time Freeze', 'Time Rewind'],
            ['Duplicate Yourself', 'Transform into Anyone'],
            ['Super Hearing', 'Super Smell'],
            ['Walk Through Walls', 'Become Invisible'],
            ['Never Age', 'Age Backwards'],
            ['Perfect Pitch', 'Perfect Memory'],
            ['Speak All Languages', 'Play All Instruments'],
            ['Paint Perfectly', 'Sing Perfectly'],
            ['Unlimited Stamina', 'Unlimited Strength'],
            ['Control Electricity', 'Control Magnetism'],
            ['See Through Lies', 'Always Tell Truth'],
            ['Lucid Dreaming', 'Control Reality'],

            // Money & Career (111-140)
            ['$1 Million Now', '$10k Monthly Forever'],
            ['Dream Job Low Pay', 'Boring Job High Pay'],
            ['Work from Home', 'Work from Office'],
            ['4 Day Work Week', 'Work 2 Hours Daily'],
            ['Be Your Own Boss', 'Work for Great Company'],
            ['Salary', 'Commission'],
            ['Job Security', 'High Risk High Reward'],
            ['Passion Career', 'Stable Career'],
            ['Remote Work Anywhere', 'Office with Great Team'],
            ['Early Retirement', 'Work You Love Forever'],
            ['Startup Founder', 'Corporate Executive'],
            ['Freelance', 'Full Time Employee'],
            ['Multiple Side Hustles', 'One Main Income'],
            ['Invest in Stocks', 'Invest in Real Estate'],
            ['Save Money', 'Spend on Experiences'],
            ['Luxury Items', 'Travel Experiences'],
            ['Big House Small Savings', 'Small House Big Savings'],
            ['New Car', 'Investment Portfolio'],
            ['Designer Clothes', 'Tech Gadgets'],
            ['Expensive Watch', 'Expensive Phone'],
            ['Private Jet Once', 'First Class Forever'],
            ['Yacht', 'Private Island'],
            ['Mansion in Suburbs', 'Penthouse in City'],
            ['Personal Chef', 'Personal Trainer'],
            ['Financial Advisor', 'Life Coach'],
            ['Win Lottery', 'Inherit Fortune'],
            ['Get Paid to Sleep', 'Get Paid to Eat'],
            ['Get Paid to Travel', 'Get Paid to Game'],
            ['Unlimited Budget Travel', 'Unlimited Budget Food'],
            ['Free Gas Forever', 'Free Food Forever'],

            // Lifestyle & Leisure (141-170)
            ['Party Every Weekend', 'Quiet Nights In'],
            ['Concert', 'Festival'],
            ['Theme Park', 'Water Park'],
            ['Camping', 'Glamping'],
            ['Road Trip', 'Flight'],
            ['Cruise', 'All-Inclusive Resort'],
            ['Backpacking', 'Luxury Travel'],
            ['Solo Travel', 'Group Travel'],
            ['Adventure Travel', 'Relaxation Travel'],
            ['Museum', 'Amusement Park'],
            ['Live Sports', 'Watch on TV'],
            ['Play Sports', 'Watch Sports'],
            ['Gym', 'Home Workout'],
            ['Yoga', 'Pilates'],
            ['Running', 'Cycling'],
            ['Swimming', 'Surfing'],
            ['Skiing', 'Snowboarding'],
            ['Rock Climbing', 'Skydiving'],
            ['Bungee Jumping', 'Paragliding'],
            ['Scuba Diving', 'Snorkeling'],
            ['Spa Day', 'Beach Day'],
            ['Shopping Spree', 'Staycation'],
            ['Night Club', 'Rooftop Bar'],
            ['Comedy Show', 'Magic Show'],
            ['Theater', 'Opera'],
            ['Art Gallery', 'Science Museum'],
            ['Zoo', 'Aquarium'],
            ['Escape Room', 'Laser Tag'],
            ['Bowling', 'Mini Golf'],
            ['Karaoke', 'Trivia Night'],

            // Relationships & Social (171-200)
            ['Many Acquaintances', 'Few Close Friends'],
            ['Big Wedding', 'Elope'],
            ['Live Together Before Marriage', 'Wait Until Marriage'],
            ['Have Kids Young', 'Have Kids Later'],
            ['Big Family', 'Small Family'],
            ['Date Friend of Friend', 'Date Stranger'],
            ['Long Distance', 'See Every Day'],
            ['Introduce Partner to Family First', 'Introduce to Friends First'],
            ['Compliments', 'Acts of Service'],
            ['Quality Time', 'Physical Touch'],
            ['Surprise Date', 'Planned Date'],
            ['Stay in Date', 'Go Out Date'],
            ['Movie Date', 'Dinner Date'],
            ['Adventure Date', 'Relaxing Date'],
            ['Group Hangout', 'One on One Time'],
            ['Text All Day', 'Call Every Night'],
            ['Social Media Official', 'Keep It Private'],
            ['Pet Together', 'Plant Together'],
            ['Cook Together', 'Order In Together'],
            ['Binge Show Together', 'Read Books Together'],
            ['Work Out Together', 'Relax Together'],
            ['Travel Together', 'Hobbies Apart'],
            ['Same Friend Group', 'Different Friend Groups'],
            ['Share Everything', 'Keep Some Privacy'],
            ['Live Near Family', 'Live Far from Family'],
            ['Celebrate All Holidays', 'Skip Celebrations'],
            ['Matching Outfits', 'Complementary Styles'],
            ['Joint Social Media', 'Separate Accounts'],
            ['Share Passwords', 'Keep Private'],
            ['Always Together', 'Healthy Space'],

            // Entertainment & Pop Culture (201-230)
            ['Marvel', 'DC'],
            ['Star Wars', 'Star Trek'],
            ['Harry Potter', 'Lord of the Rings'],
            ['Disney', 'Pixar'],
            ['Horror Movies', 'Comedy Movies'],
            ['Action Movies', 'Romance Movies'],
            ['Drama Series', 'Comedy Series'],
            ['Reality TV', 'Documentaries'],
            ['Cartoons', 'Anime'],
            ['Subtitles', 'Dubbed'],
            ['Theater Popcorn', 'Movie Snacks'],
            ['Opening Night', 'Wait for Reviews'],
            ['Binge Watch', 'Watch Weekly'],
            ['Old Classics', 'New Releases'],
            ['Box Office Hit', 'Indie Film'],
            ['Book Before Movie', 'Movie Before Book'],
            ['Fiction', 'Non-Fiction'],
            ['Physical Books', 'E-Books'],
            ['Library', 'Bookstore'],
            ['Short Stories', 'Novels'],
            ['Biography', 'Autobiography'],
            ['Poetry', 'Prose'],
            ['Graphic Novels', 'Comics'],
            ['Magazine', 'Newspaper'],
            ['Sci-Fi', 'Fantasy'],
            ['Mystery', 'Thriller'],
            ['Historical Fiction', 'Contemporary'],
            ['Stand-Up Comedy Special', 'Sitcom'],
            ['Late Night Show', 'Morning Show'],
            ['Award Show', 'Regular Show'],

            // Gaming & Esports (231-250)
            ['Single Player', 'Multiplayer'],
            ['Story Mode', 'Endless Mode'],
            ['RPG', 'FPS'],
            ['Open World', 'Linear Story'],
            ['Mobile Games', 'Console Games'],
            ['Casual Games', 'Competitive Games'],
            ['Indie Games', 'AAA Games'],
            ['Retro Games', 'Modern Games'],
            ['Controller', 'Keyboard and Mouse'],
            ['Physical Copy', 'Digital Download'],
            ['Pre-Order Games', 'Wait for Reviews'],
            ['Play on Release', 'Wait for Sale'],
            ['Complete Every Game', 'Play Many Games'],
            ['Main Story Only', '100% Completion'],
            ['Strategy Games', 'Action Games'],
            ['Puzzle Games', 'Racing Games'],
            ['Fighting Games', 'Sports Games'],
            ['Simulation Games', 'Adventure Games'],
            ['Battle Royale', 'Team Deathmatch'],
            ['League of Legends', 'Dota 2'],

            // Fashion & Style (251-270)
            ['Designer Brands', 'Thrift Stores'],
            ['Fast Fashion', 'Sustainable Fashion'],
            ['Trendy', 'Classic'],
            ['Comfortable', 'Fashionable'],
            ['Sneakers', 'Dress Shoes'],
            ['Jeans', 'Sweatpants'],
            ['T-Shirt', 'Button Up'],
            ['Hoodie', 'Jacket'],
            ['Dress', 'Jumpsuit'],
            ['Heels', 'Flats'],
            ['Makeup', 'Natural Look'],
            ['Long Hair', 'Short Hair'],
            ['Beard', 'Clean Shaven'],
            ['Tattoos', 'No Tattoos'],
            ['Piercings', 'No Piercings'],
            ['Colorful Wardrobe', 'Neutral Wardrobe'],
            ['Lots of Accessories', 'Minimalist'],
            ['Name Brand', 'No Logo'],
            ['Vintage Style', 'Modern Style'],
            ['Streetwear', 'Business Casual'],

            // Education & Learning (271-290)
            ['Online Courses', 'Traditional College'],
            ['Liberal Arts', 'STEM'],
            ['Trade School', 'University'],
            ['Self-Taught', 'Formal Education'],
            ['Study Alone', 'Study Group'],
            ['Morning Classes', 'Evening Classes'],
            ['Campus Life', 'Commuter'],
            ['Big University', 'Small College'],
            ['Internship', 'Part-Time Job'],
            ['Study Abroad', 'Stay Local'],
            ['Textbook', 'Online Resources'],
            ['Take Notes', 'Record Lectures'],
            ['Handwritten Notes', 'Laptop Notes'],
            ['Highlighters', 'Sticky Notes'],
            ['Coffee to Study', 'Tea to Study'],
            ['Library Study', 'Cafe Study'],
            ['Music While Studying', 'Silence While Studying'],
            ['Cramming', 'Consistent Study'],
            ['Multiple Choice', 'Essay Tests'],
            ['Group Project', 'Solo Project'],

            // Final Miscellaneous (291-300)
            ['Always 5 Minutes Early', 'Always 5 Minutes Late'],
            ['Know How You Die', 'Know When You Die'],
            ['Reset Your Life', 'Continue From Now'],
            ['Be Able to Edit Your Past', 'See Your Future'],
            ['$100k in Debt But Dream Life', 'Debt Free But Average Life'],
            ['Live 1000 Years', 'Live 10 Lives'],
            ['Be 10 Years Younger', 'Look 10 Years Younger'],
            ['Have All Answers', 'Ask All Questions'],
            ['World Peace', 'End Hunger'],
            ['Solve Climate Change', 'Cure All Diseases']
        ];

        this.customPrompts = [];
        this.loadFromStorage();
    }

    loadFromStorage() {
        const stored = localStorage.getItem('customPrompts');
        if (stored) {
            try {
                this.customPrompts = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load custom prompts:', e);
                this.customPrompts = [];
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('customPrompts', JSON.stringify(this.customPrompts));
    }

    getAllPrompts() {
        return [...this.customPrompts, ...this.defaultPrompts];
    }

    getRandomPrompts(count = 3) {
        const all = this.getAllPrompts();
        const selected = [];
        const usedIndices = new Set();

        while (selected.length < count && selected.length < all.length) {
            const index = Math.floor(Math.random() * all.length);
            if (!usedIndices.has(index)) {
                usedIndices.add(index);
                selected.push({
                    option1: all[index][0],
                    option2: all[index][1]
                });
            }
        }

        return selected;
    }

    addPrompt(option1, option2) {
        this.customPrompts.push([option1, option2]);
        this.saveToStorage();
    }

    removePrompt(index) {
        if (index >= 0 && index < this.customPrompts.length) {
            this.customPrompts.splice(index, 1);
            this.saveToStorage();
        }
    }

    updatePrompt(index, option1, option2) {
        if (index >= 0 && index < this.customPrompts.length) {
            this.customPrompts[index] = [option1, option2];
            this.saveToStorage();
        }
    }

    resetToDefaults() {
        this.customPrompts = [];
        this.saveToStorage();
    }

    importPrompts(promptsArray) {
        // Format: [["opt1", "opt2"], ["opt3", "opt4"], ...]
        this.customPrompts = promptsArray;
        this.saveToStorage();
    }

    exportPrompts() {
        return JSON.stringify(this.getAllPrompts(), null, 2);
    }
}
