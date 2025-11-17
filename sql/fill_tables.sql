INSERT INTO Patients (name, gender, dateOfBirth, contactNumber, address, medicalHistory)
VALUES
('John Doe', 'Male', '1985-07-12', '1234567890', '123 Elm St', 'Diabetes, Hypertension'),
('Jane Smith', 'Female', '1990-09-25', '0987654321', '456 Oak St', 'Asthma'),
 ('Michael Scott', 'Male', '1964-03-15', '2223334444', '789 Birch St', 'Hypertension'),
('Pam Beesly', 'Female', '1980-09-25', '9876543210', '456 Cedar St', 'None'),
('Dwight Schrute', 'Male', '1978-01-20', '5556667777', '123 Farm Ln', 'None'),
('Jim Halpert', 'Male', '1979-10-01', '1112223333', '321 Maple St', 'Back Pain');

INSERT INTO Doctors (name, specialization, contactNumber, email)
VALUES
('Dr. Alice Johnson', 'Cardiologist', '5551234567', 'alice.j@hospital.com'),
('Dr. Robert Brown', 'Dermatologist', '5559876543', 'robert.b@hospital.com'),
('Dr. Meredith Palmer', 'Psychiatrist', '5553334444', 'meredith.p@hospital.com'),


INSERT INTO Appointments (patientId, doctorId, appointmentDate, appointmentTime, status)
VALUES
(1, 1, '2024-10-20', '10:00:00', 'Scheduled'),
(2, 2, '2024-10-21', '11:30:00', 'Scheduled'),
(3, 1, '2024-10-22', '09:00:00', 'Completed'),
(4, 3, '2024-10-23', '12:00:00', 'Scheduled'),
(5, 4, '2024-10-24', '14:00:00', 'Cancelled');
