const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, 21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500, 46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000, 82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500, 127500, 132600, 137800, 143100, 148500, 154000, 159600];

export const getLevelFromExperience = (experience) => {
    let level = 1; // Mulai dari level 1
    for (let i = 0; i < levelThresholds.length; i++) {
        if (experience < levelThresholds[i]) {
            break;
        }
        level = i + 1;
    }
    return level;
};

export const getExperienceForLevel = (level) => {
    return levelThresholds[level - 1] || 0; // Mengembalikan EXP untuk level yang diberikan
};
