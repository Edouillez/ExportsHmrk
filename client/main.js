import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';
//Importation des Collections
import { ExportsCollection } from '/imports/db/ExportsCollection';

function MeteorCallSync(url) {
  return new Promise(function(resolve) {
    Meteor.call('upAffectURLExportComplete.update', Session.get('CurrentExport')._id, url, (reponse) => {
      resolve(reponse);
    });
  })
}

Template.Global.onCreated(function () {
  //Création des variables de session
  Meteor.call('CurrentExport', function(nomVar, valDefaut) {
   Session.set('CurrentExport', '');
  });

  //Appel répété de la fonction async ProgressionExportsEnCompletion
  const intervalID = setInterval(ProgressionExportsEnCompletion, 1000, 5);

  //Fonction asynchrone visant à incrémenter la complétion des exports "en cours" / affectation URL des exports complétés sans URL
  async function ProgressionExportsEnCompletion(ProgressionParSec)
  {
    //Incrémentation de la complétion exports "en cours"
    Meteor.call('UpCompletionExportsEnCours.update', ProgressionParSec);

    //Récupération de la première occurence d'export pour lequel l'url est égale à '' et dont l'indice de complétion est à 100
    Session.set('CurrentExport', ExportsCollection.findOne({URL: "", Completion: parseInt(100)}));
    //Si existence d'une occurence respectant les 2 contraintes, alors on fait un premier passage dans la boucle
    if(Session.get('CurrentExport') != undefined){
      do {
        //Traitement pour l'attribution aléatoire d'une url
        let Random4 = Math.floor(Math.random() * 4);
        let URLRandom;
        switch (Random4) {
            case (0):
              URLRandom = 'https://www.lempire.com/';
            break;
            case (1):
              URLRandom = 'https://www.lemlist.com/';
            break;
            case (2):
              URLRandom = 'https://www.lemverse.com/';
            break;
            case (3):
              URLRandom = 'https://www.lemstash.com/';
            break;
        }

        //Update de ladite occurence en cours avec l'url choisie aléatoirement
        //On en attend la confirmation côté serveur avant de continuer
        const tempo = await MeteorCallSync(URLRandom);
        //Récupération de l'occurence suivante à traiter si elle existe
        Session.set('CurrentExport', ExportsCollection.findOne({_id: { $ne: Session.get('CurrentExport')._id }, URL: "", Completion: parseInt(100)}));
        //Si l'occurence existe, on repasse dans la boucle
      } while (Session.get('CurrentExport') != undefined);
    }
  };
});

Template.Global.events({
  //Si clic sur bouton export -> création d'une nouvelle occurence d'export
  'click .BtnExport': function () {
    let tempLibelleExport = '';
    check(inpNewExport.value, String);
    if(inpNewExport.value.length > parseInt(0)){
      tempLibelleExport = inpNewExport.value; 
    }
    else{
      tempLibelleExport = 'N.C';
    }
    inpNewExport.value = "";
    Meteor.call('NewExport.insert', tempLibelleExport);
  },

  //Si "entree" dans la zone de saisie, création d'une nouvelle occurence d'export
  'keypress #inpNewExport' : function (event) {
  if (event.which === 13) {
        let tempLibelleExport = '';
        check(inpNewExport.value, String);
        if(inpNewExport.value.length > parseInt(0)){
          tempLibelleExport = inpNewExport.value; 
        }
        else{
          tempLibelleExport = 'N.C';
        }
        inpNewExport.value = "";
        Meteor.call('NewExport.insert', tempLibelleExport);
      }
  }
});

//On rend ExportsNotComplete exploitable pour Blaze
Template.ListeExportsNotComplete.helpers({
  ExportsNotComplete() {
    return ExportsCollection.find({Completion: {$lte: 99}});
 }
});

//On rend ExportsComplete exploitable pour Blaze
Template.ListeExportsComplete.helpers({
 ExportsComplete() {
  return ExportsCollection.find({Completion: 100});
}
});



