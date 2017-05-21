export function map_to_fragment(fn, data){

  const reduce = (data) => data.reduce(($fragment, item) => {
    const $item = fn(item);
    $fragment.appendChild($item);
    return $fragment;
  }, document.createDocumentFragment());

  return data ? reduce(data) : reduce;
}
