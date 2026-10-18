
function Programs() {
  const programs = [
    {
      title: "Weight Loss Program",
      duration: "8 Weeks",
      level: "Beginner",
      description:
        "Improve fitness, burn calories and work towards healthy fat loss with structured cardio and workout sessions.",
    },
    {
      title: "Muscle Building Program",
      duration: "12 Weeks",
      level: "Intermediate",
      description:
        "Build muscle and improve strength with resistance training and a structured progressive workout plan.",
    },
    {
      title: "Strength Training",
      duration: "10 Weeks",
      level: "Intermediate",
      description:
        "Develop overall strength and power using compound exercises and focused resistance training.",
    },
    {
      title: "General Fitness Program",
      duration: "6 Weeks",
      level: "Beginner",
      description:
        "A balanced full-body fitness program designed to improve stamina, mobility, strength and overall health.",
    },
    {
      title: "Personal Training",
      duration: "Custom",
      level: "All Levels",
      description:
        "Get personalized workout guidance from a trainer based on your fitness goals, experience and progress.",
    },
    {
      title: "Functional Training",
      duration: "8 Weeks",
      level: "All Levels",
      description:
        "Improve mobility, balance, coordination and functional strength through practical full-body movements.",
    },
  ];

  return (
    <div className="programs-page">
      <div className="programs-hero">
        <p>GYMFIT PROGRAMS</p>

        <h1>Choose Your Training Program</h1>

        <span>
          Structured fitness programs designed for different goals and
          experience levels.
        </span>
      </div>

      <div className="programs-grid">
        {programs.map((program, index) => (
          <div className="program-card" key={index}>
            <div className="program-card-top">
              <p>PROGRAM {String(index + 1).padStart(2, "0")}</p>

              <h2>{program.title}</h2>
            </div>

            <p className="program-description">
              {program.description}
            </p>

            <div className="program-details">
              <div>
                <span>Duration</span>
                <strong>{program.duration}</strong>
              </div>

              <div>
                <span>Level</span>
                <strong>{program.level}</strong>
              </div>
            </div>

            <button type="button">
              View Program
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Programs;
