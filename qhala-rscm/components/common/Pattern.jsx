//maybe screenshot the one from the qhala website and use image gen with gpt to make it transparent.
const GeometricPattern = ({ className = "" }) => {
  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          <style>
            {`
              .navy { fill: #002456; }
              .orange { fill: #F4A223; }
              .red { fill: #E94E24; }
              .beige { fill: #E6DFD2; }
              .dark-gray { fill: #333333; }
            `}
          </style>
        </defs>

        <g>
          <polygon className="red" points="20,60 40,40 40,80" />
          <polygon className="navy" points="50,60 70,40 70,80" />
          <polygon className="beige" points="80,60 100,40 100,80" />
          <circle className="navy" cx="130" cy="60" r="30" />
          <polygon className="orange" points="170,60 190,40 190,80" />
          <rect className="navy" x="200" y="30" width="60" height="60" />
          <polygon className="orange" points="270,60 290,40 290,80" />
          <polygon className="red" points="300,60 320,40 320,80" />
          <circle className="navy" cx="360" cy="60" r="30" />
          <polygon className="beige" points="400,60 420,40 420,80" />
          <polygon className="navy" points="430,60 450,40 450,80" />
          <polygon className="dark-gray" points="480,60 500,40 520,60 500,80" />
          <polygon className="red" points="530,60 550,40 550,80" />
          <polygon className="orange" points="560,60 580,40 580,80" />
          <circle className="navy" cx="620" cy="60" r="30" />
          <polygon className="orange" points="660,60 680,40 680,80" />
          <rect className="navy" x="690" y="30" width="60" height="60" />
          <polygon className="orange" points="760,60 780,40 780,80" />
          <polygon className="red" points="790,60 810,40 810,80" />
          <circle className="navy" cx="850" cy="60" r="30" />
          <polygon className="beige" points="890,60 910,40 910,80" />
          <polygon className="navy" points="920,60 940,40 940,80" />
          <polygon
            className="dark-gray"
            points="970,60 990,40 1010,60 990,80"
          />
          <polygon className="red" points="1020,60 1040,40 1040,80" />
          <polygon className="orange" points="1050,60 1070,40 1070,80" />
          <circle className="navy" cx="1110" cy="60" r="30" />
          <polygon className="orange" points="1150,60 1170,40 1170,80" />
        </g>
      </svg>
    </div>
  );
};

export default GeometricPattern;
