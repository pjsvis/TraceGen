angular.module('app').controller('ViewMediaController', function($uibModalInstance, media) {
   var vm = this;
   vm.media = media;
   console.log(vm);
   vm.ok = function() {
      $uibModalInstance.close(vm.selected.item);
   };

   vm.cancel = function() {
      $uibModalInstance.dismiss('cancel');
   };
});