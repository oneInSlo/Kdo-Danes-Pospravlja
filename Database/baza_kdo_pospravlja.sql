DROP DATABASE IF EXISTS Kdo_Danes_Pospravlja;
CREATE DATABASE Kdo_Danes_Pospravlja;

USE Kdo_Danes_Pospravlja;

DROP TABLE IF EXISTS prostor_enkratno;
DROP TABLE IF EXISTS prostor_veckratno;
DROP TABLE IF EXISTS ponavljajoce_opravilo;
DROP TABLE IF EXISTS enkratno_opravilo;
DROP TABLE IF EXISTS seznam_odgovornih;
DROP TABLE IF EXISTS prostor;
DROP TABLE IF EXISTS stanovalec;
DROP TABLE IF EXISTS registriran_uporabnik;
DROP TABLE IF EXISTS avatar;
DROP TABLE IF EXISTS slika;
DROP TABLE IF EXISTS bivalna_enota;
DROP TABLE IF EXISTS naslov;
DROP TABLE IF EXISTS posta;
DROP TABLE IF EXISTS drzava;


CREATE TABLE registriran_uporabnik (
id_registriran_uporabnik INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
datum_rojstva DATE NOT NULL,
username VARCHAR(45) NOT NULL UNIQUE,
geslo VARCHAR(72) NOT NULL,
email VARCHAR(45) NOT NULL,
TK_avatar INT,
ime_priimek VARCHAR(45)
);

CREATE TABLE avatar (
id_avatar INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
naziv VARCHAR(45),
avatar_foto VARCHAR(200)
);

CREATE TABLE stanovalec (
id_stanovalec INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
TK_registriran_uporabnik INT,
TK_bivalna_enota INT,
pravice ENUM('popolne','delne')
);

CREATE TABLE bivalna_enota (
id_bivalna_enota INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
naziv VARCHAR(45)  NOT NULL,
naslov VARCHAR(90) NOT NULL,
TK_registriran_uporabnik INT
);

CREATE TABLE slika (
id_slike INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
slika_foto VARCHAR(200),
TK_bivalna_enota INT NOT NULL
);

CREATE TABLE prostor (
id_prostor INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
naziv VARCHAR(45)  NOT NULL,
TK_bivalna_enota INT
);

CREATE TABLE seznam_odgovornih (
id_seznam_odgovornih INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
TK_stanovalec INT,
TK_ponavljajoce_opravilo INT,
datum DATE NOT NULL,
opravljeno BOOLEAN NOT NULL
);

CREATE TABLE enkratno_opravilo (
id_enkratno_opravilo INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
rok DATE NOT NULL,
naziv VARCHAR(45) NOT NULL,
trajanje INT NOT NULL,
datum_dodajanja DATE NOT NULL,
datum_zadnje_spremembe DATE NOT NULL,
opravljeno TINYINT,
TK_stanovalec INT
);

CREATE TABLE ponavljajoce_opravilo (
id_ponavljajoce_opravilo INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
datum_zacetka DATE NOT NULL,
datum_konca DATE NOT NULL,
naziv VARCHAR(45) NOT NULL,
ponavljanje ENUM('dnevno', 'tedensko', 'mesecno') NOT NULL,
trajanje INT NOT NULL,
datum_dodajanja DATE NOT NULL,
datum_zadnje_spremembe DATE NOT NULL,
potrebno_stevilo INT NOT NULL,
rok INT,
TK_seznam_odgovornih INT
);

CREATE TABLE prostor_enkratno (
id_prostor_enkratno INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
TK_enkratno_opravilo INT,
TK_prostor INT
);

CREATE TABLE prostor_veckratno (
id_prostor_veckratno INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
TK_ponavljajoce_opravilo INT,
TK_prostor INT
);

ALTER TABLE stanovalec ADD CONSTRAINT TK_stanovalec_registriran_uporabnik FOREIGN KEY (TK_registriran_uporabnik) REFERENCES registriran_uporabnik(id_registriran_uporabnik) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE stanovalec ADD CONSTRAINT TK_stanovalec_bivalna_enota FOREIGN KEY (TK_bivalna_enota) REFERENCES bivalna_enota(id_bivalna_enota) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE bivalna_enota ADD CONSTRAINT TK_registriran_uporabnik_bivalna_enota FOREIGN KEY (TK_registriran_uporabnik) REFERENCES registriran_uporabnik(id_registriran_uporabnik) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE prostor ADD CONSTRAINT TK_prostor_bivalna_enota FOREIGN KEY (TK_bivalna_enota) REFERENCES bivalna_enota(id_bivalna_enota) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE seznam_odgovornih ADD CONSTRAINT TK_seznam_odgovornih_stanovalec FOREIGN KEY (TK_stanovalec) REFERENCES stanovalec(id_stanovalec) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE Kdo_Danes_Pospravlja.seznam_odgovornih ADD CONSTRAINT TK_seznam_odgovornih_ponavljajoce_opravilo FOREIGN KEY (TK_ponavljajoce_opravilo) REFERENCES Kdo_Danes_Pospravlja.ponavljajoce_opravilo(id_ponavljajoce_opravilo) ON UPDATE SET NULL ON DELETE SET NULL;

ALTER TABLE enkratno_opravilo ADD CONSTRAINT TK_enkratno_opravilo_stanovalec FOREIGN KEY (TK_stanovalec) REFERENCES stanovalec(id_stanovalec) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ponavljajoce_opravilo ADD CONSTRAINT TK_ponavljajoce_opravilo_seznam_odgovornih FOREIGN KEY (TK_seznam_odgovornih) REFERENCES seznam_odgovornih(id_seznam_odgovornih) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE prostor_enkratno ADD CONSTRAINT TK_prostor_enkratno_enkratno_opravilo FOREIGN KEY (TK_enkratno_opravilo) REFERENCES enkratno_opravilo(id_enkratno_opravilo) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE prostor_enkratno ADD CONSTRAINT TK_prostor_enkratno_prostor FOREIGN KEY (TK_prostor) REFERENCES prostor(id_prostor) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE prostor_veckratno ADD CONSTRAINT TK_prostor_veckratno_ponavljajoce_opravilo FOREIGN KEY (TK_ponavljajoce_opravilo) REFERENCES ponavljajoce_opravilo(id_ponavljajoce_opravilo) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE prostor_veckratno ADD CONSTRAINT TK_prostor_veckratno_prostor FOREIGN KEY (TK_prostor) REFERENCES prostor(id_prostor) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE slika ADD CONSTRAINT TK_slika_bivalna_enota FOREIGN KEY (TK_bivalna_enota) REFERENCES bivalna_enota(id_bivalna_enota) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE registriran_uporabnik ADD CONSTRAINT TK_registriran_uporabnik_avatar FOREIGN KEY (TK_avatar) REFERENCES avatar(id_avatar) ON UPDATE CASCADE ON DELETE CASCADE;


INSERT INTO registriran_uporabnik (datum_rojstva, username, geslo, email, ime_priimek) VALUES
('2000-01-01', 'Ana123', 'geslo123', 'ana@example.com', 'Ana Novak'),
('1995-05-12', 'Luka456', 'geslo456', 'luka@example.com', 'Luka Kova'),
('1988-09-30', 'Maja789', 'geslo789', 'maja@example.com', 'Maja Horvat'),
('1976-03-25', 'Janez112', 'geslo112', 'janez@example.com', 'Janez Krajnc'),
('1998-11-18', 'Eva345', 'geslo345', 'eva@example.com', 'Eva Zupancic'),
('2002-07-08', 'Marko678', 'geslo678', 'marko@example.com', 'Marko Kotnik'),
('1990-12-15', 'Nina901', 'geslo901', 'nina@example.com', 'Nina Bizjak'),
('1985-04-20', 'Tomaž234', 'geslo234', 'tomaz@example.com', 'Tomaž Oblak'),
('1993-08-11', 'Sara567', 'geslo567', 'sara@example.com', 'Sara Kovacic'),
('1979-06-07', 'Miha890', 'geslo890', 'miha@example.com', 'Miha Petrovic'),
('2001-02-28', 'Petra1234', 'geslo1234', 'petra@example.com', 'Petra Pavlovic'),
('1997-10-03', 'Matej5678', 'geslo5678', 'matej@example.com', 'Matej Golob'),
('1983-07-17', 'Barbara9012', 'geslo9012', 'barbara@example.com', 'Barbara Vidmar'),
('1972-09-05', 'Bojan3456', 'geslo3456', 'bojan@example.com', 'Bojan Kramar'),
('1999-04-12', 'Živa7890', 'geslo7890', 'ziva@example.com', 'Ziva Koren'),
('2003-11-30', 'Matic12345', 'geslo12345', 'matic@example.com', 'Matic Jerman'),
('1987-01-22', 'Erika67890', 'geslo67890', 'erika@example.com', 'Erika Hribar'),
('1994-08-14', 'Andrej123456', 'geslo123456', 'andrej@example.com', 'Andrej Kovacevic'),
('1980-05-01', 'Tanja789012', 'geslo789012', 'tanja@example.com', 'Tanja Babic'),
('1974-12-28', 'Andreja1234567', 'geslo1234567', 'andreja@example.com', 'Andreja Golub');



INSERT INTO bivalna_enota (naziv, naslov, TK_registriran_uporabnik) VALUES
('Apartment 1', 1, 1),
('Apartment 2', 2, 2),
('Apartment 3', 3, 3);

-- For Bivalna enota 1
INSERT INTO stanovalec (TK_registriran_uporabnik, TK_bivalna_enota, pravice) VALUES
(1, 1, 'popolne'),
(2, 1, 'popolne'),
(3, 1, 'popolne'),
(4, 1, 'delne'),
(5, 1, 'delne'),
(6, 1, 'delne');

-- For Bivalna enota 2
INSERT INTO stanovalec (TK_registriran_uporabnik, TK_bivalna_enota, pravice) VALUES
(7, 2, 'popolne'),
(8, 2, 'popolne'),
(9, 2, 'delne'),
(10, 2, 'delne'),
(11, 2, 'delne'),
(12, 2, 'delne'),
(13, 2, 'popolne');

-- For Bivalna enota 3
INSERT INTO stanovalec (TK_registriran_uporabnik, TK_bivalna_enota, pravice) VALUES
(14, 3, 'popolne'),
(15, 3, 'popolne'),
(16, 3, 'delne'),
(17, 3, 'delne'),
(18, 3, 'delne'),
(19, 3, 'delne'),
(20, 3, 'popolne');

INSERT INTO prostor (naziv, TK_bivalna_enota) VALUES
('kuhinja', 1),
('dnevna soba', 1),
('kopalnica', 1),
('hodnik', 1),
('okolica', 1);

-- For Bivalna enota 2
INSERT INTO prostor (naziv, TK_bivalna_enota) VALUES
('kuhinja', 2),
('dnevna soba', 2),
('kopalnica', 2),
('hodnik', 2),
('okolica', 2);

-- For Bivalna enota 3
INSERT INTO prostor (naziv, TK_bivalna_enota) VALUES
('kuhinja', 3),
('dnevna soba', 3),
('kopalnica', 3),
('hodnik', 3),
('okolica', 3);

INSERT INTO enkratno_opravilo (rok, naziv, trajanje, datum_dodajanja, datum_zadnje_spremembe, opravljeno, TK_stanovalec) 
VALUES 
('2024-06-01', 'pobiranje_jagod', 60, '2024-05-17', '2024-05-17', 0, 1),
('2024-06-10', 'pleskanje', 180, '2024-05-17', '2024-05-17', 0, 7),
('2024-06-20', 'polaganje_keramike', 300, '2024-05-17', '2024-05-17', 0, 14);



INSERT INTO prostor_enkratno (TK_enkratno_opravilo, TK_prostor) VALUES
(1, 5),
(2, 7),
(3, 13);
  
INSERT INTO seznam_odgovornih (TK_stanovalec, datum, opravljeno) VALUES 
-- bivalna enota 1
(1, '2024-06-06', false), 
(2, '2024-02-06', false), 
(3, '2024-02-06', false),
-- bivalna enota 2
(7, '2024-05-30', false), 
(8, '2024-05-30', false), 
(9, '2024-02-06', false),
-- bivalna enota 3
(14, '2024-06-06', false), 
(15, '2024-05-30', false), 
(16, '2024-02-06', false);



INSERT INTO ponavljajoce_opravilo (datum_zaceTKa, datum_konca, naziv, ponavljanje, trajanje, datum_dodajanja, datum_zadnje_spremembe, potrebno_stevilo, TK_seznam_odgovornih) 
VALUES 
('2024-01-01', '2025-01-01', 'sesanje', 'tedensko', 120, '2024-05-17', '2025-05-17', 2, 1), 
('2024-01-01', '2025-01-01', 'kuhanje', 'dnevno', 60, '2024-05-17', '2025-05-17', 1, 4), 
('2024-01-01', '2025-01-01', 'pomivanje oken', 'mesecno', 180, '2024-05-17', '2025-05-17', 3, 7);


INSERT INTO prostor_veckratno (TK_ponavljajoce_opravilo, TK_prostor) VALUES
(1, 2),
(2, 6),
(3, 14);


INSERT INTO Kdo_Danes_Pospravlja.avatar (naziv, avatar_foto) VALUES
('man-1', './img/avatars/man-1.png'),
('woman-1', './img/avatars/woman-1.png'),
('man-2', './img/avatars/man-2.png'),
('woman-2', './img/avatars/woman-2.png'),
('man-3', './img/avatars/man-3.png'),
('woman-3', './img/avatars/woman-3.png'),
('man-4', './img/avatars/man-4.png'),
('woman-4', './img/avatars/woman-4.png'),
('man-5', './img/avatars/man-5.png'),
('woman-5', './img/avatars/woman-5.png');
