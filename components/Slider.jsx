import ReactSlider from 'react-slider';

const Slider = ({ currentValue, setCurrentValue, minVal, maxVal }) => {
  return (
    <ReactSlider
      defaultValue={0}
      value={currentValue}
      onChange={(value) => setCurrentValue(value)}
      className='max-w-[100px] w-[300px] '
      trackClassName='customSlider-track'
      thumbClassName='customSlider-thumb'
      markClassName='customSlider-mark'
      // marks={20}
      min={minVal}
      max={maxVal}
    />
  );
};

export default Slider;
