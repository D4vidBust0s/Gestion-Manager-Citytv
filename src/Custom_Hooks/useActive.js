

export const useActive = ({e,classTarget,classActive}) => {

    if (e.target.classList == classTarget) {
      let aux = document.getElementsByClassName(classActive);

      for (let index = 0; index < aux.length; index++) {
        aux[index].classList.remove(classActive);
      }

      e.target.classList.add(classActive);
    }

}
