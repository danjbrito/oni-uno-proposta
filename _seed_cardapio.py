#!/usr/bin/env python3
"""Write data/cardapio.json — source of truth for public menus and gestão."""

from __future__ import annotations

import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

FLAVOR_GROUPS = [
    {
        "id": "leite",
        "title": "À base de leite",
        "lead": "Cremosos, intensos e produzidos com leite fresco e ingredientes naturais.",
        "compact": False,
        "flavors": [
            {
                "id": "chocolate-branco-caramelo",
                "name": "Chocolate branco com caramelo e crocante",
                "desc": "Chocolate branco, calda de caramelo salgado e crocante de amêndoas.",
                "tags": ["castanhas"],
                "inVitrine": True,
            },
            {
                "id": "casadinho",
                "name": "Casadinho",
                "desc": "Fior di latte mesclado com brigadeiro de panela — chocolate e branco.",
                "tags": [],
                "inVitrine": True,
            },
            {
                "id": "fior-di-latte",
                "name": "Fior di Latte",
                "desc": "Leite e creme de leite fresco. O clássico que combina com tudo.",
                "tags": [],
                "inVitrine": True,
            },
            {
                "id": "pacoca",
                "name": "Paçoca",
                "desc": "Amendoim com farofinha de paçoca.",
                "tags": ["amendoim"],
                "inVitrine": True,
            },
            {
                "id": "doce-de-leite",
                "name": "Doce de leite",
                "desc": "Sorvete de doce de leite meeesmo, bem mineiro.",
                "tags": [],
                "inVitrine": True,
            },
            {
                "id": "tapioca",
                "name": "Tapioca",
                "desc": "Tapioca granulada com um toque de coco.",
                "tags": [],
                "inVitrine": True,
            },
            {
                "id": "flocos",
                "name": "Flocos",
                "desc": "Fior di latte com flocos de chocolate meio amargo.",
                "tags": [],
                "inVitrine": True,
            },
            {
                "id": "coco",
                "name": "Coco",
                "desc": "Coco com (muitos) pedaços de coco fresco.",
                "tags": [],
                "inVitrine": True,
            },
            {
                "id": "chocolate",
                "name": "Chocolate",
                "desc": "Leite, creme de leite fresco e chocolate nobre.",
                "tags": [],
                "inVitrine": True,
            },
            {
                "id": "banoffee",
                "name": "Banoffee",
                "desc": "Banana, doce de leite e farofinha de biscoito.",
                "tags": ["glúten"],
                "inVitrine": True,
            },
            {
                "id": "capuccino",
                "name": "Capuccino",
                "desc": "Café mesclado com doce de leite cremoso e flocos de chocolate.",
                "tags": [],
                "inVitrine": True,
            },
            {
                "id": "cheesecake-morango",
                "name": "Cheesecake de morango",
                "desc": "Cream cheese, massa de torta e geleia artesanal da casa.",
                "tags": ["glúten"],
                "inVitrine": True,
            },
            {
                "id": "gianduia",
                "name": "Gianduia",
                "desc": "Chocolate com avelã — aquele bombom dourado, sabe?",
                "tags": ["castanhas"],
                "inVitrine": True,
            },
            {
                "id": "pistache",
                "name": "Pistache",
                "desc": "Cremoso, aveludado, levemente tostado.",
                "tags": ["castanhas"],
                "inVitrine": True,
            },
            {
                "id": "iogurte-mirtilo",
                "name": "Iogurte com calda de mirtilo",
                "desc": "Iogurte fresco com calda de mirtilo.",
                "tags": [],
                "inVitrine": True,
            },
        ],
    },
    {
        "id": "agua",
        "title": "À base de água",
        "lead": "Leves, refrescantes e livres de ingredientes de origem animal.",
        "compact": False,
        "flavors": [
            {
                "id": "frutas-vermelhas",
                "name": "Frutas Vermelhas",
                "desc": "Sorbet de amora, framboesa e morango.",
                "tags": ["vegano"],
                "inVitrine": True,
            },
            {
                "id": "chocolate-sorbetto",
                "name": "Chocolate Sorbetto",
                "desc": "Cacau intenso, água e açúcar.",
                "tags": ["vegano"],
                "inVitrine": True,
            },
            {
                "id": "caja",
                "name": "Cajá",
                "desc": "Sorbet de cajá puro.",
                "tags": ["vegano"],
                "inVitrine": True,
            },
            {
                "id": "abacaxi-caju",
                "name": "Abacaxi e caju",
                "desc": "Sorbet de abacaxi com caju.",
                "tags": ["vegano"],
                "inVitrine": True,
            },
            {
                "id": "limao-manjericao",
                "name": "Limão com manjericão",
                "desc": "Acidez do limão com o aroma do manjericão fresco.",
                "tags": ["vegano"],
                "inVitrine": True,
            },
            {
                "id": "manga-maracuja",
                "name": "Manga com maracujá",
                "desc": "Combinação tropical, leve e intensa.",
                "tags": ["vegano"],
                "inVitrine": True,
            },
        ],
    },
    {
        "id": "diet",
        "title": "Diet",
        "lead": "Feito para quem busca equilíbrio, sem abrir mão do sabor.",
        "compact": True,
        "flavors": [
            {"id": "coco-diet", "name": "Coco Diet", "desc": "", "tags": [], "inVitrine": True},
            {"id": "cafe-diet", "name": "Café Diet", "desc": "", "tags": [], "inVitrine": True},
            {"id": "pacoca-diet", "name": "Paçoca Diet", "desc": "", "tags": ["amendoim"], "inVitrine": True},
            {"id": "fior-diet", "name": "Fior di latte Diet", "desc": "", "tags": [], "inVitrine": True},
            {"id": "chocolate-diet", "name": "Chocolate Diet", "desc": "", "tags": [], "inVitrine": True},
            {"id": "morango-diet", "name": "Morango Diet", "desc": "", "tags": [], "inVitrine": True},
        ],
    },
]

CATEGORIES = [
    {
        "id": "tamanhos",
        "eyebrow": "Como pedir",
        "title": "Tamanhos e preços",
        "cards": [
            {
                "id": "copinhos",
                "name": "Copinhos",
                "desc": "Até 3 sabores + biscoito artesanal",
                "image": "images/copinho.jpg",
                "alt": "Copinho ONI UNO com gelato e biscoito waffle",
                "tags": [],
                "items": [
                    {"id": "copinho-p", "name": "Pequeno 125g", "note": "", "price": 16},
                    {"id": "copinho-m", "name": "Médio 150g", "note": "", "price": 18},
                    {"id": "copinho-g", "name": "Grande 200g", "note": "", "price": 20},
                ],
            },
            {
                "id": "casquinhas",
                "name": "Casquinhas",
                "desc": "Até 2 sabores · feitas na gelateria · 150g",
                "image": "images/casquinha.jpg",
                "alt": "Casquinhas artesanais da gelateria",
                "tags": [],
                "items": [
                    {"id": "casquinha-trad", "name": "Tradicional", "note": "", "price": 21},
                    {"id": "casquinha-nutella", "name": "Com Nutella", "note": "", "price": 24},
                ],
            },
            {
                "id": "para-levar",
                "name": "Para levar",
                "desc": "Até 3 sabores + biscoitos da casa",
                "image": "images/para-levar.jpg",
                "alt": "Embalagens ONI UNO para levar com gelato e biscoitos",
                "tags": [],
                "items": [
                    {
                        "id": "levar-meio",
                        "name": "½ kg (690ml)",
                        "note": "Acompanha pacote com 6 biscoitos",
                        "price": 55,
                    },
                    {
                        "id": "levar-kg",
                        "name": "1 kg (1300ml)",
                        "note": "Acompanha pacote com 12 biscoitos",
                        "price": 95,
                    },
                ],
            },
            {
                "id": "picoles",
                "name": "Picolés",
                "desc": "Para os pequenos — e para os pets",
                "image": "images/picoles.jpg",
                "alt": "Criança sorrindo com picolé",
                "tags": [],
                "items": [
                    {
                        "id": "picole-bebe",
                        "name": "Picolé bebê",
                        "note": "100% frutas, sem açúcar, corantes ou conservantes",
                        "price": 6,
                    },
                    {
                        "id": "gelate",
                        "name": "geLate",
                        "note": "Para pets · renda para a ONG Resgate Noroeste",
                        "price": 5,
                    },
                ],
            },
        ],
    },
    {
        "id": "sobremesas",
        "eyebrow": "Doce da casa",
        "title": "Sobremesas",
        "cards": [
            {
                "id": "brownie",
                "name": "Brownie",
                "desc": "Artesanal, servido quentinho com uma bola de Fior di latte e calda de chocolate cremosa.",
                "image": "images/sobremesas.jpg",
                "alt": "Sobremesas em camadas da ONI UNO",
                "tags": ["castanhas", "glúten"],
                "items": [
                    {"id": "brownie-gelato", "name": "Brownie com gelato", "note": "", "price": 25},
                ],
            }
        ],
    },
    {
        "id": "cafeteria",
        "eyebrow": "Para acompanhar",
        "title": "Cafeteria",
        "cards": [
            {
                "id": "bebidas",
                "name": "Bebidas",
                "desc": "",
                "image": "images/cafeteria.jpg",
                "alt": "Café com latte art",
                "tags": [],
                "items": [
                    {
                        "id": "espresso",
                        "name": "Café espresso",
                        "note": "Servido com uma mini-bola de gelato",
                        "price": 7,
                    },
                    {
                        "id": "agua",
                        "name": "Água",
                        "note": "Com gás ou sem gás",
                        "price": 5,
                    },
                ],
            }
        ],
    },
]

STORES = {
    "sudoeste": {
        "id": "sudoeste",
        "name": "Sudoeste",
        "file": "cardapio-sudoeste.html",
        "address": "CLSW 103 Bloco B Loja 1 — Subsolo",
        "hours": [
            {"label": "Segunda", "value": "12h – 18h"},
            {"label": "Terça a domingo", "value": "12h – 19h"},
        ],
        "maps": "https://maps.google.com/?q=CLSW+103+Bloco+B+Loja+1+Sudoeste+Brasília",
        "ifood": "https://www.ifood.com.br/delivery/brasilia-df/oni-uno-gelato---sorvete-sudoeste-setor-sudoeste/a16ed348-624a-4c3f-95b3-22ea90a01055",
    },
    "asa-norte": {
        "id": "asa-norte",
        "name": "Asa Norte",
        "file": "cardapio-asa-norte.html",
        "address": "CLN 303 Bloco A Loja 16",
        "hours": [
            {"label": "Terça", "value": "12h – 18h"},
            {"label": "Quarta a domingo", "value": "12h – 20h"},
            {"label": "Segunda", "value": "Fechado"},
        ],
        "maps": "https://maps.google.com/?q=CLN+303+Bloco+A+Loja+16+Asa+Norte+Brasília",
        "ifood": "https://www.ifood.com.br/delivery/brasilia-df/oni-uno-gelato---sorvete-asa-norte-asa-norte/f6c8bb5d-3c3e-4d44-b9ca-97238064ccbe",
    },
}


def build() -> dict:
    stores = {}
    for key, meta in STORES.items():
        stores[key] = {
            **meta,
            "flavorGroups": copy.deepcopy(FLAVOR_GROUPS),
            "categories": copy.deepcopy(CATEGORIES),
        }
    return {
        "updatedAt": "2026-10-26T12:00:00-03:00",
        "stores": stores,
    }


def main() -> None:
    path = ROOT / "data" / "cardapio.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", path, path.stat().st_size)


if __name__ == "__main__":
    main()
