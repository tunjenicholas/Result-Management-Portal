// Grading System
exports.calculateGrade = (marks) => {
    let grade = '';
    let points = 0;

    if (marks >= 80) { grade = 'A'; points = 12; }
    else if (marks >= 75) {
         grade = 'A-'; points = 11; 
        }
    else if (marks >= 70) { 
        grade = 'B+'; points = 10;
     }
    else if (marks >= 65) {
         grade = 'B'; points = 9; 
        }
    else if (marks >= 60) {
         grade = 'B-'; points = 8; 
        }
    else if (marks >= 55) {
         grade = 'C+'; points = 7; 
        }
    else if (marks >= 50) {
         grade = 'C'; points = 6; 
        }
    else if (marks >= 45) {
         grade = 'C-'; points = 5; 
        }
    else if (marks >= 40) {
         grade = 'D+'; points = 4;
         }
    else if (marks >= 35) {
         grade = 'D'; points = 3;
         }
    else if (marks >= 30) {
         grade = 'D-'; points = 2;
         }
    else { 
        grade = 'E'; points = 1; 
    }

    return { grade, points };
};
