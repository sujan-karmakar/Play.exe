const User = require("../models/user");

module.exports.getProfileData = async (user) => {
    // Total Score Calculation 
    const userTotalScore = (user.points.guessingGame || 0) + 
                           (user.points.ticTacToe || 0) + 
                           (user.points.simonGame || 0) + 
                           (user.points.rockPaperScissors || 0);

    // Global Rank 
    const globalRankData = await User.aggregate([
        {
            $addFields: {
                totalScore: {
                    $add: [
                        { $ifNull: ["$points.guessingGame", 0] },
                        { $ifNull: ["$points.ticTacToe", 0] },
                        { $ifNull: ["$points.simonGame", 0] },
                        { $ifNull: ["$points.rockPaperScissors", 0] }
                    ]
                }
            }
        },
        { $sort: { totalScore: -1 } },
        {
            $group: {
                _id: null,
                users: { $push: { _id: "$_id", totalScore: "$totalScore" } }
            }
        },
        {
            $unwind: { path: "$users", includeArrayIndex: "rank" }
        },
        {
            $match: { "users._id": user._id }
        },
        {
            $project: { rank: { $add: ["$rank", 1] } }
        }
    ]);

    const globalRank = (globalRankData.length > 0 ? globalRankData[0].rank : 0);

    // Game Ranks
    const countHigher = async (gameField) => {
        const score = user.points[gameField] || 0;
        let query = {};
        query['points.' + gameField] = { $gt: score };
        const count = await User.countDocuments(query);
        return count + 1;
    };

    const ranks = {
        ticTacToe: await countHigher('ticTacToe'),
        rockPaperScissors: await countHigher('rockPaperScissors'),
        simonGame: await countHigher('simonGame'),
        guessingGame: await countHigher('guessingGame')
    };

    return { totalScore: userTotalScore, globalRank, ranks };
};