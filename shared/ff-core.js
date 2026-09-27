/*
 * Gemeinsame Basis der Lernapp FF Lengenfeld.
 *
 * Klassisches Script ohne Build-Schritt. Alle Pfade werden relativ zur
 * aufrufenden Seite aufgeloest, damit die App unveraendert auf GitHub Pages
 * (Unterverzeichnis /FFUeben/) und lokal laeuft.
 */
var FF = (function () {
    'use strict';

    var statusToken = 0;

    function host() {
        return document.querySelector('.app-container') ||
               document.querySelector('.station-container') ||
               document.body;
    }

    /*
     * Haengt ein Element oberhalb der Karteikarte ein. Auf Seiten ohne
     * Karteikarte direkt unter die Ueberschrift, sonst ans Ende.
     */
    function insertAboveCard(element) {
        var parent = host();
        var card = parent.querySelector('.flashcard');
        if (card && card.parentNode === parent) {
            parent.insertBefore(element, card);
            return;
        }
        var heading = parent.querySelector('h1');
        if (heading && heading.parentNode === parent && heading.nextSibling) {
            parent.insertBefore(element, heading.nextSibling);
            return;
        }
        parent.appendChild(element);
    }

    function statusElement() {
        var el = document.getElementById('ffStatus');
        if (el) {
            return el;
        }
        el = document.createElement('div');
        el.id = 'ffStatus';
        el.className = 'status-message';
        el.setAttribute('role', 'status');
        el.style.display = 'none';
        insertAboveCard(el);
        return el;
    }

    /*
     * Zeigt eine Meldung sichtbar in der Seite an.
     * kind: 'info' (Standard), 'success' oder 'error'.
     */
    function showStatus(message, kind, autoHideMs) {
        var el = statusElement();
        var token = ++statusToken;
        el.className = 'status-message status-' + (kind || 'info');
        el.textContent = message;
        el.style.display = 'block';
        if (autoHideMs) {
            window.setTimeout(function () {
                if (token === statusToken) {
                    clearStatus();
                }
            }, autoHideMs);
        }
    }

    function clearStatus() {
        var el = document.getElementById('ffStatus');
        statusToken++;
        if (el) {
            el.textContent = '';
            el.style.display = 'none';
        }
    }

    /*
     * Meldet einen Fehler sichtbar in der Seite - nicht nur in der Konsole.
     * Ohne das bleibt bei fehlenden Daten nur der Platzhaltertext stehen.
     */
    function reportError(error, userMessage) {
        console.error(userMessage || 'Fehler in der Lernapp:', error);
        var detail = (error && error.message) ? ' (' + error.message + ')' : '';
        showStatus((userMessage || 'Es ist ein Fehler aufgetreten.') +
                   ' Bitte die Seite neu laden.' + detail, 'error');
    }

    /* Laedt eine JSON-Datei und macht HTTP- und Parse-Fehler sichtbar. */
    function loadJson(url) {
        return fetch(url).then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ' bei ' + url);
            }
            return response.json().catch(function () {
                throw new Error('Ungueltiges JSON in ' + url);
            });
        });
    }

    /*
     * Laedt eine oder mehrere JSON-Dateien und fuegt sie zu einem Kartenstapel
     * zusammen. Leere oder unerwartet aufgebaute Datenbestaende gelten als
     * Fehler, damit keine stumme Karte stehen bleibt.
     */
    function loadDeck(sources) {
        var urls = Array.isArray(sources) ? sources : [sources];
        return Promise.all(urls.map(loadJson)).then(function (parts) {
            var cards = [];
            parts.forEach(function (part, index) {
                if (!Array.isArray(part)) {
                    throw new Error('Kein Karten-Array in ' + urls[index]);
                }
                cards = cards.concat(part);
            });
            if (cards.length === 0) {
                throw new Error('Keine Karten in ' + urls.join(', '));
            }
            return cards;
        });
    }

    /* Fisher-Yates auf einer Kopie - das Original bleibt unveraendert. */
    function shuffle(array) {
        var copy = array.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    /* Meldet fehlende Bilddateien, statt nur ein kaputtes Symbol zu zeigen. */
    function watchImages(message) {
        Array.prototype.forEach.call(document.getElementsByTagName('img'), function (img) {
            img.addEventListener('error', function () {
                var src = img.getAttribute('src');
                if (src) {
                    showStatus((message || 'Ein Bild konnte nicht geladen werden') +
                               ': ' + src, 'error');
                }
            });
        });
    }

    /* Fuehrt den Rueckruf aus, sobald das DOM benutzbar ist. */
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    /* ----------------------------------------------------------------
     * Aufrufzaehlung (GoatCounter)
     *
     * Gezaehlt wird serverseitig bei GoatCounter - ohne Cookies, ohne
     * localStorage und ohne dass IP-Adressen gespeichert werden. Die
     * Zahlen liest das Dashboard der Startseite ueber den oeffentlichen
     * Zaehler-Endpunkt wieder aus, dafuer ist kein Schluessel noetig.
     * ---------------------------------------------------------------- */

    /* Die einzige Stelle, an der die GoatCounter-Kennung steht. */
    var ZAEHLER_CODE = 'konstiffl';

    /*
     * Sorgt dafuer, dass dieselbe Seite immer unter demselben Namen gezaehlt
     * wird - egal ob sie lokal, unter /FFUeben/ oder als Verzeichnis ohne
     * Dateinamen aufgerufen wird.
     */
    function zaehlPfad(pfad) {
        var p = String(pfad || '/').replace(/^\/FFUeben(?=\/|$)/, '');
        if (p === '' || p === '/') {
            p = '/index.html';
        }
        return p;
    }

    /*
     * Haengt das Zaehl-Script ein. GoatCounter zaehlt von sich aus weder auf
     * localhost noch bei file://, lokale Tests verfaelschen die Zahlen also
     * nicht. Wird das Script blockiert, passiert einfach nichts.
     */
    function zaehleAufruf() {
        window.goatcounter = window.goatcounter || {};
        window.goatcounter.path = function (p) { return zaehlPfad(p); };

        var script = document.createElement('script');
        script.async = true;
        script.src = '//gc.zgo.at/count.js';
        script.setAttribute('data-goatcounter',
            'https://' + ZAEHLER_CODE + '.goatcounter.com/count');
        document.head.appendChild(script);
    }

    /* Oeffentlicher Zaehler-Endpunkt. Der Pfad beginnt selbst mit "/", daher
       stehen in der fertigen Adresse zwei Schraegstriche hintereinander. */
    function zaehlerUrl(pfad) {
        return 'https://' + ZAEHLER_CODE + '.goatcounter.com/counter/' + pfad + '.json';
    }

    /* GoatCounter liefert die Zahl als formatierten String ("1,234"). */
    function zaehlerZahl(wert) {
        var roh = (wert === undefined || wert === null) ? '' : String(wert);
        return parseInt(roh.replace(/\D/g, ''), 10) || 0;
    }

    zaehleAufruf();

    return {
        insertAboveCard: insertAboveCard,
        showStatus: showStatus,
        clearStatus: clearStatus,
        reportError: reportError,
        loadJson: loadJson,
        loadDeck: loadDeck,
        shuffle: shuffle,
        watchImages: watchImages,
        ready: ready,
        zaehlPfad: zaehlPfad,
        zaehlerUrl: zaehlerUrl,
        zaehlerZahl: zaehlerZahl
    };
}());
