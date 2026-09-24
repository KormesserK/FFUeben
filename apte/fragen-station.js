/*
 * Gemeinsame Konfiguration der vier Fragenkatalog-Seiten der APTE.
 * Die Seiten unterscheiden sich nur in den geladenen Sachgebieten.
 */
function starteFragenkatalog(quellen, bezeichnung) {
    'use strict';

    FF.flashcards.start({
        source: quellen,
        subject: bezeichnung,
        renderer: FF.renderers.fields({
            front: {
                sachgebietText: function (frage) { return frage.sachgebiet || null; },
                questionText: function (frage) { return frage.question; },
                questionImage: function (frage) {
                    return frage.bild ? 'Bilder/' + frage.bild : null;
                }
            },
            back: {
                answerText: function (frage) { return frage.answer; },
                answerImage: function (frage) {
                    return frage.antwortBild ? 'Bilder/' + frage.antwortBild : null;
                }
            }
        })
    });
}
