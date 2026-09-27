/*
 * Karteikarten-Engine der Lernapp FF Lengenfeld.
 *
 * Buendelt die Logik, die vorher in jeder Station einzeln stand: Laden,
 * Mischen, 5er-Gruppen-Lernmodus, Umdrehen, Fortschritt und Fehlermeldungen.
 * Eine Station besteht dadurch nur noch aus einer kurzen Konfiguration.
 */
(function (FF) {
    'use strict';

    /* ----------------------------------------------------------------
     * Renderer: bilden eine Karte auf die Elemente der Seite ab.
     * Ein Renderer hat showFront(karte) und showBack(karte).
     * ---------------------------------------------------------------- */

    /*
     * Setzt eine Gruppe von Feldern. Schluessel ist die Element-ID,
     * Wert eine Funktion, die den Inhalt liefert. Gibt sie null zurueck,
     * wird das Element ausgeblendet (z. B. Antwortbild statt Antworttext).
     */
    function applyFields(fieldGroup, card, visible) {
        if (!fieldGroup) {
            return;
        }
        Object.keys(fieldGroup).forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) {
                return;
            }
            var value = fieldGroup[id](card);
            if (value === null || value === undefined) {
                el.style.display = 'none';
                return;
            }
            if (el.tagName === 'IMG') {
                el.src = value;
            } else {
                el.textContent = value;
            }
            /* Leerer String stellt den Wert aus dem Stylesheet wieder her,
               damit z. B. ein span inline bleibt und nicht zu block wird. */
            el.style.display = visible ? '' : 'none';
        });
    }

    function fields(spec) {
        var frontId = spec.frontContainer !== undefined ? spec.frontContainer : 'cardQuestion';
        var backId = spec.backContainer !== undefined ? spec.backContainer : 'cardAnswer';

        function toggleContainers(frontVisible) {
            var front = frontId ? document.getElementById(frontId) : null;
            var back = backId ? document.getElementById(backId) : null;
            if (front) {
                front.style.display = frontVisible ? '' : 'none';
            }
            if (back) {
                back.style.display = frontVisible ? 'none' : '';
            }
        }

        return {
            showFront: function (card) {
                /* Erst die Gegenseite ausblenden: Stationen, die Vorder- und
                   Rueckseite im selben Element zeigen, funktionieren so auch. */
                applyFields(spec.back, card, false);
                applyFields(spec.front, card, true);
                toggleContainers(true);
            },
            showBack: function (card) {
                applyFields(spec.front, card, false);
                applyFields(spec.back, card, true);
                toggleContainers(false);
            }
        };
    }

    /* Haeufigster Fall: Frage vorne, Antwort hinten. */
    function questionAnswer() {
        return fields({
            front: {
                questionText: function (card) { return card.question; }
            },
            back: {
                answerText: function (card) { return card.answer; }
            }
        });
    }

    /* Stationen mit nur einem Textfeld fuer Frage und Antwort. */
    function singleText(elementId) {
        var id = elementId || 'cardText';
        var front = {};
        var back = {};
        front[id] = function (card) { return card.question; };
        back[id] = function (card) { return card.answer; };
        return fields({
            front: front,
            back: back,
            frontContainer: null,
            backContainer: null
        });
    }

    /* Bildkarten: Frage als Bild, Antwort als Bild oder als Text. */
    function imageQuestion() {
        return fields({
            front: {
                questionImage: function (card) { return card.questionImage; }
            },
            back: {
                answerImage: function (card) { return card.answerImage || null; },
                answerText: function (card) { return card.answerImage ? null : card.answer; }
            }
        });
    }

    /* ----------------------------------------------------------------
     * Engine
     * ---------------------------------------------------------------- */

    /* Text hinter dem Fragezeichen neben dem Gruppenmodus. */
    var HILFE_GRUPPENMODUS = [
        'Ist der Gruppenmodus aus, wird jede Karte zuf\u00e4llig aus dem ganzen ' +
            'Stapel gezogen. Bei mehreren hundert Karten dauert es dann lange, ' +
            'bis dieselbe Karte ein zweites Mal kommt.',
        'Ist er ein, lernst du in Bl\u00f6cken zu f\u00fcnf Karten. Eine Karte ' +
            'verl\u00e4sst den Block, sobald du sie auf \u201eRichtig\u201c setzt. ' +
            'Ist der Block leer, kommen die n\u00e4chsten f\u00fcnf.',
        'Dadurch siehst du dieselben f\u00fcnf Karten kurz hintereinander mehrmals ' +
            '\u2013 und genau das pr\u00e4gt sich leichter ein, als sich einmal quer ' +
            'durch den ganzen Stapel zu arbeiten. Zum ersten Lernen eines Bereichs ist ' +
            'der Gruppenmodus deshalb meist die bessere Wahl. Zum Wiederholen kurz vor ' +
            'der Pr\u00fcfung eignet sich der volle Stapel besser, weil die Fragen dort ' +
            'genauso unvorhersehbar kommen.'
    ];

    /* Legt Umschalter, Hilfe und Fortschrittszeile an. Die Engine baut sie
       immer selbst, damit jede Station dieselben Bedienelemente hat. */
    function ensureControls() {
        var wrapper = document.createElement('div');
        wrapper.className = 'group-mode-toggle';

        var label = document.createElement('label');
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'groupModeCheckbox';
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' 5er-Gruppen-Lernmodus'));
        wrapper.appendChild(label);

        var hilfeKnopf = document.createElement('button');
        hilfeKnopf.type = 'button';
        hilfeKnopf.className = 'hilfe-knopf';
        hilfeKnopf.id = 'groupModeHilfe';
        hilfeKnopf.textContent = '?';
        hilfeKnopf.setAttribute('aria-label', 'Was ist der 5er-Gruppen-Lernmodus?');
        hilfeKnopf.setAttribute('aria-expanded', 'false');
        hilfeKnopf.setAttribute('aria-controls', 'groupModeHilfeText');
        wrapper.appendChild(hilfeKnopf);

        FF.insertAboveCard(wrapper);

        var hilfeText = document.createElement('div');
        hilfeText.id = 'groupModeHilfeText';
        hilfeText.className = 'hilfe-text';
        hilfeText.hidden = true;
        HILFE_GRUPPENMODUS.forEach(function (absatz) {
            var p = document.createElement('p');
            p.textContent = absatz;
            hilfeText.appendChild(p);
        });
        FF.insertAboveCard(hilfeText);

        hilfeKnopf.addEventListener('click', function () {
            var oeffnen = hilfeText.hidden;
            hilfeText.hidden = !oeffnen;
            hilfeKnopf.setAttribute('aria-expanded', oeffnen ? 'true' : 'false');
        });

        var progress = document.createElement('div');
        progress.id = 'groupProgress';
        progress.className = 'progress-text';
        FF.insertAboveCard(progress);

        return { checkbox: checkbox, progress: progress };
    }

    function bindButton(id, handler) {
        var button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    }

    /*
     * Startet eine Karteikarten-Station.
     *
     * config.source       - JSON-Pfad relativ zur Seite, oder ein Array davon
     * config.renderer     - Renderer, siehe FF.renderers
     * config.subject      - Bezeichnung fuer Meldungen, z. B. "Die Fragen zu AU11"
     * config.groupMode    - Gruppenmodus vorbelegen (Standard: false)
     * config.groupSize    - Kartenanzahl je Gruppe (Standard: 5)
     * config.filter       - waehlt aus, welche Karten mitspielen
     * config.emptyMessage - Hinweis, wenn der Filter nichts uebrig laesst
     */
    function start(config) {
        FF.ready(function () {
            var renderer = config.renderer || questionAnswer();
            var groupSize = config.groupSize || 5;
            /* Standardmaessig aus - der Modus ist erklaerungsbeduerftig und
               soll bewusst eingeschaltet werden. */
            var groupMode = config.groupMode === true;
            var subject = config.subject || 'Die Karten';

            var allCards = [];
            var remaining = [];   /* noch offene Karten ausserhalb der Gruppe */
            var group = [];       /* aktuelle Lerngruppe */
            var groupTotal = 0;
            var current = null;
            var showingAnswer = false;
            var controls = null;

            function isReady() {
                return allCards.length > 0;
            }

            function activeSet() {
                return groupMode ? group : remaining;
            }

            function updateProgress() {
                var open = remaining.length + group.length;
                if (groupMode) {
                    controls.progress.textContent = 'Gruppe: ' + group.length + ' von ' +
                        groupTotal + ' Karten offen · insgesamt noch ' + open +
                        ' von ' + allCards.length;
                } else {
                    controls.progress.textContent = 'Noch ' + open + ' von ' +
                        allCards.length + ' Karten offen';
                }
                controls.progress.style.display = 'block';
            }

            function startNextGroup() {
                group = FF.shuffle(remaining.splice(0, Math.min(groupSize, remaining.length)));
                groupTotal = group.length;
            }

            /* Die Karte bleibt verborgen, solange nichts darauf steht -
               sonst zeigt sie die Platzhalter von Vorder- und Rueckseite zugleich. */
            function setCardVisible(sichtbar) {
                var card = document.querySelector(".flashcard");
                if (card) {
                    card.style.display = sichtbar ? "" : "none";
                }
            }

            function setFlipped(flipped) {
                var card = document.querySelector('.flashcard');
                if (card) {
                    card.classList.toggle('flip', flipped);
                }
            }

            function finish() {
                current = null;
                updateProgress();
                FF.showStatus('Glückwunsch! Alle ' + allCards.length +
                    ' Karten sind gelernt. Mit „Neues Spiel“ geht es von vorne los.',
                    'success');
            }

            function showNext() {
                if (!isReady()) {
                    return;
                }
                var set = activeSet();
                if (set.length === 0) {
                    if (groupMode && remaining.length > 0) {
                        startNextGroup();
                        set = group;
                    } else {
                        finish();
                        return;
                    }
                }

                /* Nicht zweimal hintereinander dieselbe Karte zeigen. */
                var candidate;
                if (set.length === 1) {
                    candidate = set[0];
                } else {
                    do {
                        candidate = set[Math.floor(Math.random() * set.length)];
                    } while (candidate === current);
                }

                current = candidate;
                showingAnswer = false;
                renderer.showFront(current);
                setFlipped(false);
                updateProgress();
            }

            function flip() {
                if (!current) {
                    return;
                }
                showingAnswer = !showingAnswer;
                if (showingAnswer) {
                    renderer.showBack(current);
                } else {
                    renderer.showFront(current);
                }
                setFlipped(showingAnswer);
            }

            function markCorrect() {
                if (!current) {
                    return;
                }
                var set = activeSet();
                var index = set.indexOf(current);
                if (index !== -1) {
                    set.splice(index, 1);
                }
                showNext();
            }

            function markIncorrect() {
                /* Karte bleibt im Pool und kommt spaeter wieder. */
                if (current) {
                    showNext();
                }
            }

            function reset(message) {
                if (!isReady()) {
                    return;
                }
                remaining = FF.shuffle(allCards);
                group = [];
                groupTotal = 0;
                current = null;
                if (groupMode) {
                    startNextGroup();
                }
                FF.clearStatus();
                showNext();
                if (message) {
                    FF.showStatus(message, 'info', 2500);
                }
            }

            /* Die Inline-Handler in den bestehenden Seiten bleiben gueltig. */
            window.flipCard = flip;
            window.getNextQuestion = showNext;
            window.markCorrect = markCorrect;
            window.markIncorrect = markIncorrect;
            window.resetGame = function () { reset('Neues Spiel gestartet.'); };

            bindButton('correctBtn', markCorrect);
            bindButton('incorrectBtn', markIncorrect);
            bindButton('nextBtn', showNext);
            bindButton('resetBtn', window.resetGame);

            controls = ensureControls();
            controls.checkbox.checked = groupMode;
            controls.checkbox.addEventListener('change', function () {
                groupMode = controls.checkbox.checked;
                reset(groupMode
                    ? '5er-Gruppen-Lernmodus aktiviert.'
                    : 'Gruppenmodus aus – alle Karten im Pool.');
            });

            FF.watchImages('Ein Kartenbild konnte nicht geladen werden');
            FF.showStatus(subject + ' werden geladen …', 'info');
            controls.progress.style.display = 'none';
            setCardVisible(false);

            FF.loadDeck(config.source)
                .then(function (cards) {
                    /* Ein Filter blendet Karten aus, die noch nicht gepflegt sind
                       oder auf dieser Feuerwehr nicht zutreffen. */
                    var usable = typeof config.filter === 'function'
                        ? cards.filter(config.filter)
                        : cards;
                    if (usable.length === 0) {
                        FF.showStatus(config.emptyMessage ||
                            (subject + ' sind noch nicht erfasst.'), 'info');
                        return;
                    }
                    allCards = usable;
                    setCardVisible(true);
                    remaining = FF.shuffle(allCards);
                    if (groupMode) {
                        startNextGroup();
                    }
                    FF.clearStatus();
                    showNext();
                })
                .catch(function (error) {
                    FF.reportError(error, subject + ' konnten nicht geladen werden.');
                });
        });
    }

    FF.renderers = {
        fields: fields,
        questionAnswer: questionAnswer,
        singleText: singleText,
        imageQuestion: imageQuestion
    };

    FF.flashcards = { start: start };
}(FF));
