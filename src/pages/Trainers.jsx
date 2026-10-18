
function Trainers() {
  const trainers = [
    {
      name: "Ashish Tele",
      role: "Strength & Conditioning Trainer",
      experience: "5+ Years Experience",
      specialty:
        "Strength training, muscle building and structured workout programs.",
    },
    {
      name: "Somnath Pimple",
      role: "Fitness & Weight Loss Trainer",
      experience: "4+ Years Experience",
      specialty:
        "Weight loss, cardio, endurance and general fitness programs.",
    },
    {
      name: "Dipali Katgar",
      role: "Personal & Functional Trainer",
      experience: "4+ Years Experience",
      specialty:
        "Personal training, functional workouts, mobility and fitness guidance.",
    },
  ];

  return (
    <div className="trainers-page">

      <div className="trainers-hero">
        <p>GYMFIT TRAINERS</p>

        <h1>Meet Our Professional Trainers</h1>

        <span>
          Experienced trainers who help members stay consistent,
          improve performance and reach their fitness goals.
        </span>
      </div>

      <div className="trainers-grid">

        {trainers.map((trainer, index) => (
          <div
            className="trainer-card"
            key={index}
          >

            <div className="trainer-number">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="trainer-info">

              <h2>
                {trainer.name}
              </h2>

              <h3>
                {trainer.role}
              </h3>

              <p className="trainer-experience">
                {trainer.experience}
              </p>

              <p className="trainer-specialty">
                {trainer.specialty}
              </p>

            </div>

            <button type="button">
              View Trainer
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Trainers;
