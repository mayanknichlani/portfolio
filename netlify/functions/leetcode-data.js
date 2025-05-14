// Netlify serverless function for LeetCode API
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  }

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    }
  }

  // Get username from query parameters
  const username = event.queryStringParameters.username

  if (!username) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Username is required" }),
    }
  }

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query userProfile($username: String!) {
            matchedUser(username: $username) {
              username
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
              profile {
                ranking
                reputation
                starRating
              }
              contestBadge {
                name
                rating
                topPercentage
              }
            }
            userContestRanking(username: $username) {
              rating
              attendedContestsCount
              globalRanking
              totalParticipants
              topPercentage
              badge {
                name
              }
            }
          }
        `,
        variables: {
          username: username,
        },
      }),
    })

    const data = await response.json()

    if (data.errors) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "LeetCode API error" }),
      }
    }

    const userData = data.data

    // Format the data
    const formattedData = {
      rating: userData.userContestRanking?.rating || "N/A",
      maxRating: userData.userContestRanking?.rating || "N/A",
      rank: userData.userContestRanking?.badge?.name || "N/A",
      bestRank: userData.userContestRanking?.globalRanking || "N/A",
      solved: calculateTotalSolved(userData),
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedData),
    }
  } catch (error) {
    console.error("Error fetching LeetCode data:", error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch LeetCode data" }),
    }
  }
}

function calculateTotalSolved(userData) {
  let totalSolved = 0
  if (userData.matchedUser?.submitStats?.acSubmissionNum) {
    userData.matchedUser.submitStats.acSubmissionNum.forEach((item) => {
      totalSolved += item.count
    })
  }
  return totalSolved || "N/A"
}
