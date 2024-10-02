# Endpointi

## Splosna pravila
1. Pri vsakem requestu se vedno poslje zraven tudi JWT (json web token) ali neke vrste session token, ki identificira prijavljenega uporabnika. Backend vrne samo informacije, ki so temu uporabniku z tem session tokenom dostopne. Naprimer: Franc poslje login informacije backendu (se prijavi) -> backend poslje session token -> Franc poslje GET $/units in session token, ki ga je dobil od serverja -> backend vrne samo enote, ki so vezane na tega uporabnika (ne poslje celotne MySQL tabele)

2. Uporabnik lahko dela samo z stvarmi do katerih ima dostop. Naprimer: 
Franc poslje POST $/tasks/00001230/finish zraven doda tudi svoj session token -> Backend prebere session token in ugotovi, da je ta request poslal Franc -> backend ugotovi, da opravila z st. 00001230 ni med opravili, do katerih ima franc dostop -> backend poslje nazaj 403 Forbidden.

3. Backend mora vracati pomenske error code. 
Ce uporabnik nima dostopa: 403 Forbidden
Ce uporabnik ni poslal session tokena: 401 Unauthorized
Ce se uporabnik zmoti in proba dodati na opravilo id-osebe, ki ne obstaja (ali kaj podobnega): 404 Not Found
Ce uporabnik naprimer poslje GET $/units//tasks (brez id) : 400 Bad Request
Ce streznik ne ve kaj je slo narobe (ampak je nekaj slo): 500 Internal Server Error
Ce je vse okej: 200 OK

To bi mogle bit vse, ki jih moramo uporabit. (201, 202 nebomo delali, ker se mi zdi overkill)

BTW na frontendu je te error kode potrebno pravilno prikazovati glede na napako, ki se je zgodilo

## Oblika JSON bodyev 
client -> server :
{
    session: %sessionToken,
    data: [] ali {}
}

server -> client (status == 200) :
{
    data: [] ali {}
}

server -> client (status != 200) :
{
    msg: ""
}


## Login/Registracija
POST $/login (v body username, password) -> vrne session token in user info

Registracija:
POST $/users -> (v body vse info)
PUT $/users/%username -> (za urejanje profila, v body vse info)
DELETE $/users/%username

## Opravila
GET $/units/%id-unit
GET $/units/%id-unit/tasks -> spisek vseh id opravil vezanih na uporabnika
GET $/units/%id-unit/tasks?type=onetime/repeating/finished
GET $/tasks/%id-task -> vse info o opravilu (cisto vse, z osebami itd, ampak samo do nivoja po katerem obstaja endpoint za vec informacij, v primeru oseb, samo do id-osebe, obstaj endpoint GET $/person/%id-person)

POST $/tasks/%id-task/finish (prazn body)
POST $/tasks (v body json )
PUT $/tasks/%id-task (overridea opravilo z bodyem) 

POST $/tasks/%id-task/users/%username (dodajanje osebe na opravilo)
DELETE $/tasks/%id-task/users/%username

## Bivalne enote
GET $/units
GET $/units/$id-enota 
PUT $/units/%id-unit (uredi bivalno enoto, stare info se prepisejo z celotnim bodyem)

GET $units/%id-unit/users
POST $/units/%id-unit/users/%username
DELETE $/units/%id-unit/users/%username

## Osebe
GET $/users (vrne samo osebe, ki so uporabniku znane (imata skupne bivalne prostore)
GET $/users/%username

