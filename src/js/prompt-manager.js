// Prompt Manager - Handles all Would You Rather prompts
class PromptManager {
    constructor() {
        this.defaultPrompts = [
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
            ['Reading', 'Writing']
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
