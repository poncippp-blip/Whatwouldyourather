// Engagement Manager - Handles engagement prompts and hooks
class EngagementManager {
    constructor() {
        this.commentEngagement = {
            enabled: true,
            prompts: [
                {
                    text: 'Comment "I love God"',
                    image: 'assets/images/engagement/comment.png',
                    position: 'top'
                },
                {
                    text: 'Reject the offer',
                    image: 'assets/images/engagement/reject.png',
                    position: 'bottom'
                }
            ]
        };

        this.shareEngagement = {
            enabled: true,
            prompts: [
                {
                    text: 'Get a curse',
                    curses: [
                        'Always be alone',
                        'Have bad luck forever',
                        'Lose your legs',
                        'Go bald instantly',
                        'Stuck in elevator for 24h',
                        'Never taste food again',
                        'Sleep only 2 hours daily',
                        'Constant headaches',
                        'Never use phone again',
                        'Lose all your money'
                    ],
                    position: 'top'
                },
                {
                    text: 'Marry the 3rd person when you click share',
                    image: 'assets/images/engagement/marry.png',
                    position: 'bottom'
                }
            ]
        };

        this.followEngagement = {
            enabled: true,
            text: 'Follow for more "Would You Rather" videos!'
        };

        this.likeEngagement = {
            enabled: true,
            text: 'Like if you chose option 1!'
        };
    }

    getRandomCurse() {
        const curses = this.shareEngagement.prompts[0].curses;
        return curses[Math.floor(Math.random() * curses.length)];
    }

    getEngagementForQuestion(questionIndex, totalQuestions) {
        // Return engagement based on question index
        // Last question gets the main engagement
        if (questionIndex === totalQuestions - 1) {
            const engagements = [];

            if (this.commentEngagement.enabled) {
                engagements.push({
                    type: 'comment',
                    data: this.commentEngagement.prompts
                });
            }

            if (this.shareEngagement.enabled) {
                const curse = this.getRandomCurse();
                engagements.push({
                    type: 'share',
                    data: [
                        { ...this.shareEngagement.prompts[0], selectedCurse: curse },
                        this.shareEngagement.prompts[1]
                    ]
                });
            }

            // Pick one randomly
            if (engagements.length > 0) {
                return engagements[Math.floor(Math.random() * engagements.length)];
            }
        }

        return null;
    }

    setEngagementEnabled(type, enabled) {
        switch (type) {
            case 'comment':
                this.commentEngagement.enabled = enabled;
                break;
            case 'share':
                this.shareEngagement.enabled = enabled;
                break;
            case 'follow':
                this.followEngagement.enabled = enabled;
                break;
            case 'like':
                this.likeEngagement.enabled = enabled;
                break;
        }
    }

    getEnabledEngagements() {
        return {
            comment: this.commentEngagement.enabled,
            share: this.shareEngagement.enabled,
            follow: this.followEngagement.enabled,
            like: this.likeEngagement.enabled
        };
    }
}
