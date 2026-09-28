-- Het eerste nieuwsbericht: Smash Squad, de nieuwe jeugdwerking. De tekst komt
-- van de aankondiging die de club al gemaakt had.
--
-- De hoofdfoto (`image`) blijft leeg: die staat in Cloudinary en wordt in het
-- beheerpaneel geüpload, bij tabblad "Nieuws". Zolang ze leeg is toont de pagina
-- gewoon de gekleurde achtergrond.
INSERT INTO news_articles (slug, title, subtitle, intro, highlighted, cta_url, cta_label, blocks)
VALUES (
  'smash-squad',
  'Smash Squad',
  'Balgewenning voor onze allerkleinsten',
  'Bij Smash Squad maken kinderen van 3 tot 7 jaar op een speelse manier kennis met de bal: rennen, mikken, vangen, gooien en samen bewegen staan centraal. Een brede, plezierige kennismaking met balspelen — de eerste stap richting sport, in een veilige en enthousiaste omgeving. We trappen af op zondag 6 september; iedereen is welkom in Kristoffelheem.',
  true,
  'https://www.fitham.be/contact',
  'Schrijf in',
  $json$[
    {
      "type": "cards",
      "title": "Van balgewenning tot balvaardig voor het leven",
      "intro": "Smash Squad begeleidt kinderen stap voor stap: eerst breed spelenderwijs bewegen met bal en lichaam, en daarna — wie wil — doorgroeien naar échte volleybaltechnieken bij Start 2 Volley.",
      "cards": [
        {
          "title": "Smash Squad Groep 1",
          "meta": "3–4 jaar · zondag 10u00–11u00",
          "body": "De allerkleinsten maken op een speelse manier kennis met bal, ruimte en beweging. Motorische spelletjes en veel plezier staan hier centraal — nog geen \"echt\" volleybal, wel de eerste stap richting sport.",
          "bullets": [
            "Kristoffelheem, Ham",
            "Start op zondag 6 september 2026",
            "€90 per kind, tot eind april (niet tijdens schoolvakanties)"
          ]
        },
        {
          "title": "Smash Squad Groep 2",
          "meta": "5–7 jaar · zondag 11u00–12u00",
          "body": "Met wat meer motorische vaardigheden in huis gaan we een stapje verder: eerste balvaardigheden, samen spelen en de fijne kneepjes van bewegen met een bal, altijd nog op een speelse en toegankelijke manier.",
          "bullets": [
            "Kristoffelheem, Ham",
            "Start op zondag 6 september 2026",
            "€90 per kind, tot eind april (niet tijdens schoolvakanties)"
          ]
        },
        {
          "title": "Start 2 Volley",
          "meta": "7–8 jaar · doorstroom vanaf Groep 2",
          "body": "Klaar voor meer? Vanuit Groep 2 stromen kinderen door naar Start 2 Volley, waar ze de échte volleybaltechnieken aanleren en 4 keer per jaar mogen proeven van een heus tornooi.",
          "bullets": [
            "Sporthal 't Vlietje, Ham",
            "Extra training op woensdag 15u00–16u30",
            "4 tornooien per jaar (Jos Rutten-tornooien), telkens 10u30–12u30 in Sporthal Runkst, Hasselt",
            "€145 per kind, tot eind april (niet tijdens schoolvakanties)"
          ]
        }
      ]
    },
    {
      "type": "faq",
      "title": "Nog vragen voor je inschrijft?",
      "intro": "Dit zijn de vragen die ons het vaakst bereiken. Staat die van jou er niet bij? Neem gerust contact op.",
      "items": [
        {
          "question": "Moet mijn kind al ervaring hebben met bal of sport?",
          "answer": "Nee. Smash Squad is er net op gericht om kinderen spelenderwijs te laten kennismaken met de bal — voorkennis is niet nodig."
        },
        {
          "question": "Trainen jullie ook tijdens de schoolvakanties?",
          "answer": "Nee, er is geen training tijdens de schoolvakanties. De exacte data worden nog gecommuniceerd."
        },
        {
          "question": "Wat moet mijn kind meebrengen?",
          "answer": "Sportieve kledij, een drinkbus, en sportschoenen met een non-marking zool (of turnpantoffels)."
        },
        {
          "question": "Hoe schrijf ik mijn kind in?",
          "answer": "Stuur een mail naar vcfithambestuur@gmail.com om te laten weten dat je zoon of dochter interesse heeft, of schrijf meteen in via de knop \"Schrijf in\" op deze pagina."
        },
        {
          "question": "Is een gratis proefles mogelijk?",
          "answer": "Ja, je mag steeds 3 keer gratis meetrainen voor we overgaan tot inschrijving bij de club."
        },
        {
          "question": "Is er korting bij inschrijving van broer of zus?",
          "answer": "Ja, vanaf 2 leden uit hetzelfde gezin krijg je 10% korting."
        },
        {
          "question": "Is mijn kind verzekerd tijdens de trainingen?",
          "answer": "Ja, je kind is verzekerd via Ethias door de aansluiting bij Volley Vlaanderen."
        },
        {
          "question": "Kan mijn kind ook later instappen?",
          "answer": "Ja, je kind kan het hele jaar door instappen. Het lidgeld vermindert bovendien na 1 december en na 1 maart."
        }
      ]
    },
    {
      "type": "buttons",
      "title": "Inschrijven",
      "intro": "Klaar om in te schrijven? Laat het ons weten via het contactformulier, of volg de werking mee op Facebook.",
      "buttons": [
        { "label": "Schrijf in", "url": "https://www.fitham.be/contact", "style": "primary" },
        {
          "label": "Volg ons op Facebook",
          "url": "https://www.facebook.com/permalink.php?story_fbid=pfbid02WzEAA1MEwX8Qs1ZcT6DyxQ4R813sxDZ3txH8omCMZmPxYR5ngkp5eteAWZXyYwMzl&id=100063627339831",
          "style": "secondary"
        }
      ]
    },
    {
      "type": "locations",
      "title": "Waar vind je ons",
      "intro": "Smash Squad traint in Kristoffelheem, Start 2 Volley in Sporthal 't Vlietje. Tik op een locatie voor de route.",
      "locations": [
        { "name": "Kristoffelheem", "address": "3945 Ham" },
        { "name": "Sporthal 't Vlietje", "address": "Sportlaan 10a, 3945 Ham" }
      ]
    }
  ]$json$::jsonb
);
