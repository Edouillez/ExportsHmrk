import { Meteor } from 'meteor/meteor';
import { ExportsCollection } from '/imports/db/ExportsCollection';


Meteor.methods({
  //Méthode insertion nouvelle occurence Export
  'NewExport.insert'(Libelle){
    ExportsCollection.insert({
    'Libelle': Libelle,
    'URL': '',
    'StyleStr': '',
    'Completion': 0
  });
  return 'insert ok';
  },

  //Méthode mise à jour des occurences <100% : incrémentation complétion
  'UpCompletionExportsEnCours.update'(ValeurProgression) { 
    ExportsCollection.update({Completion: {$lte: 99}}, 
      { $inc:{Completion: ValeurProgression}}, {multi: true});
    return 'update ok';
   },

  //Méthode mise à jour des occurences 100% ET url vide : ajout d'une url
  'upAffectURLExportComplete.update'(id, url) { 
    ExportsCollection.update({_id: id}, 
      { $set: {URL: url} });
    return 'update ok';
   },
});


