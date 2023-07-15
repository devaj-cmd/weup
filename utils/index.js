// Function to paginate the results
const paginateResults = (results, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    users: paginatedResults,
    totalResults: results.length,
    currentPage: page,
    limit: limit,
  };
};

// Function to calculate age similarity score
const calculateAgeSimilarity = (loggedInUserAge, otherUserAge) => {
  const minAge1 = loggedInUserAge[0];
  const maxAge1 = loggedInUserAge[1];
  const minAge2 = otherUserAge[0];
  const maxAge2 = otherUserAge[1];

  const maxMinAgeDiff = Math.max(minAge1 - maxAge2, minAge2 - maxAge1);
  const minMaxAgeDiff = Math.min(maxAge1 - minAge2, maxAge2 - minAge1);
  const ageDiff = Math.max(0, maxMinAgeDiff, minMaxAgeDiff);

  const maxAgeDiff = maxAge1 - minAge1 + maxAge2 - minAge2;
  const ageSimilarity = 1 - ageDiff / maxAgeDiff;

  return ageSimilarity;
};

// Function to calculate similarity score based on user preferences
const calculateSimilarity = (loggedInUser, otherUser) => {
  const loggedInUserPreference = loggedInUser.preferences;
  const otherUserPreference = otherUser.preferences;
  let score = 0;

  // Age similarity
  const ageScore = calculateAgeSimilarity(
    loggedInUserPreference.age,
    otherUserPreference.age
  );
  score += ageScore;

  // Height similarity
  const heightDiff = Math.abs(
    loggedInUserPreference.height - otherUserPreference.height
  );
  const heightScore = heightDiff <= 5 ? 1 : 0;
  score += heightScore;

  // Distance similarity
  const distanceDiff = Math.abs(
    loggedInUserPreference.distance - otherUserPreference.distance
  );
  const distanceScore = distanceDiff <= 10 ? 1 : 0;
  score += distanceScore;

  // Ethnicity similarity
  const ethnicityScore =
    loggedInUserPreference.ethnicity === otherUserPreference.ethnicity ? 1 : 0;
  score += ethnicityScore;

  // Relationship goals similarity
  const relationshipGoalsScore =
    loggedInUserPreference.relationshipGoals ===
    otherUserPreference.relationshipGoals
      ? 1
      : 0;
  score += relationshipGoalsScore;

  // Smoking similarity
  const smokingScore =
    loggedInUserPreference.smoking === otherUserPreference.smoking ? 1 : 0;
  score += smokingScore;

  // Drinking similarity
  const drinkingScore =
    loggedInUserPreference.drinking === otherUserPreference.drinking ? 1 : 0;
  score += drinkingScore;

  // Interested gender similarity
  const interestedGenderScore =
    loggedInUserPreference.interested_gender === otherUserPreference.gender
      ? 1
      : 0;
  score += interestedGenderScore;

  const interestsScore = calculateInterestsSimilarity(
    loggedInUser.my_interests,
    otherUser.my_interests
  );

  score += interestsScore;

  return parseFloat(score.toFixed(2)); //
};

const calculateInterestsSimilarity = (
  loggedInUserInterests,
  otherUserInterests
) => {
  const commonInterests = loggedInUserInterests.filter((interest) =>
    otherUserInterests.includes(interest)
  );

  const similarity =
    commonInterests.length /
    Math.max(loggedInUserInterests.length, otherUserInterests.length);

  return similarity;
};

module.exports = {
  paginateResults,
  calculateSimilarity,
};
