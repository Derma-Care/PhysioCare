/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-comment-textnodes */
// eslint-disable-next-line react/prop-types
export default function BodySvg({ veiew, onClickPart, getColor }) {
  return (
    <g>
      {/* ================= FRONT ================= */}

      
        <g>
          <ellipse
            cx="100"
            cy="65"
            rx="25"
            ry="35"
            // stroke="black"
            fill={getColor('head')}
            onClick={(e) => onClickPart('head', e )}
          />

          <rect
            x="85"
            y="100"
            width="30"
            height="15"
            // stroke="black"
            fill={getColor('neck')}
            onClick={(e) => onClickPart('neck',e)}
          />

          <path
            d="M80 120 L130 120 L140 200 L60 200 Z"
            // stroke="black"
            fill={getColor('chest')}
            onClick={(e) => onClickPart('chest',e)}
          />

          <path
            d="M75 200 L125 200 L120 260 L80 260 Z"
            // stroke="black"
            fill={getColor('abdomen')}
            onClick={(e) => onClickPart('abdomen',e)}
          />

          <path
            d="M80 260 L120 260 L130 310 L70 310 Z "
            // stroke="black"
            fill={getColor('pelvis')}
            onClick={(e) => onClickPart('pelvis',e)}
          />

          <circle
            cx="55"
            cy="140"
            r="15"
            // stroke="black"
            fill={getColor('leftShoulder')}
            onClick={(e) => onClickPart('leftShoulder',e)}
          />

          <circle
            cx="155"
            cy="140"
            r="15"
            // stroke="black"
            fill={getColor('rightShoulder')}
            onClick={(e) => onClickPart('rightShoulder',e)}
          />

          <rect
            x="22"
            y="170"
            width="20"
            height="60"
            // stroke="black"
            fill={getColor('leftArm')}
               transform="rotate(5 172.5 260)"
            onClick={(e) => onClickPart('leftArm',e)}
          />

          <rect
            x="155"
            y="150"
            width="15"
            height="60"
            // stroke="black"
            fill={getColor('rightArm')}
            onClick={(e) => onClickPart('rightArm',e)}
          />

          <rect
            x="20"
            y="250"
            width="18"
            height="80"
            // stroke="black"
            fill={getColor('leftForearm')}
              transform="rotate(10 172.5 260)"
            onClick={(e) => onClickPart('leftForearm',e)}
          />

          <rect
  x="170"
  y="220"
  width="20"
  height="80"
  // stroke="black"
  fill={getColor("rightForearm")}
  transform="rotate(-15 172.5 260)"
  onClick={(e) => onClickPart("rightForearm",e)}
/>

          <path
            // x="55"
            // y="310"
             d="M55 310 L100 310 L100 380 60 380 Z "
            // width="30"
            // height="90"
            // stroke="black"
            fill={getColor('leftThigh')}
            onClick={(e) => onClickPart('leftThigh',e)}
          />

          <path
            // x="100"
            // y="280"
            // width="15"
            // height="90"
            d="M100 310 L150 310 L145 380 110 380 Z "
            // stroke="black"
            fill={getColor('rightThigh')}
            onClick={(e) => onClickPart('rightThigh',e)}
          />

          <circle
            cx="83"
            cy="400"
            r="15"
            // stroke="black"
            fill={getColor('leftKnee')}
            onClick={(e) => onClickPart('leftKnee',e)}
          />

          <circle
            cx="125"
            cy="400"
            r="15"
            // stroke="black"
            fill={getColor('rightKnee')}
            onClick={(e) => onClickPart('rightKnee',e)}
          />

          <path
            // x="80"
            // y="415"
            // width="25"
            // height="80"
                 d="M70 420 L100 420 L105 510 85 510 Z "
            // stroke="black"
            fill={getColor('leftLeg')}
            onClick={(e) => onClickPart('leftLeg',e)}
          />

         <path
            // x="100"
            // y="390"
            // width="15"
            // height="80"
            d="M110 420 L140 420 L125 510 110 510 Z "
            // stroke="black"
            fill={getColor('rightLeg')}
            onClick={(e) => onClickPart('rightLeg',e)}
          />  

          <ellipse
            cx="95"
            cy="530"
            rx="12"
            ry="16"
            // stroke="black"
            fill={getColor('leftFoot')}
            onClick={(e) => onClickPart('leftFoot')}
          />

          <ellipse
            cx="125"
            cy="530"
            rx="12"
            ry="16"
            // stroke="black"
            fill={getColor('rightFoot')}
            onClick={(e) => onClickPart('rightFoot',e)}
          />
        </g>
      

      {/* ================= BACK ================= */}

      
        <g transform="translate(290, 0)" >
          <ellipse
            cx="100"
            cy="60"
            rx="25"
            ry="30"
            stroke="black"
            fill={getColor('backHead')}
            onClick={(e) => onClickPart('backHead',e)}
          />

          <rect
            x="90"
            y="90"
            width="20"
            height="15"
            stroke="black"
            fill={getColor('backNeck')}
            onClick={(e) => onClickPart('backNeck',e)}
          />

          <path
            d="M70 110 L130 110 L140 170 L60 170 Z"
            stroke="black"
            fill={getColor('upperBack')}
            onClick={(e) => onClickPart('upperBack',e)}
          />

          <path
            d="M75 170 L125 170 L120 240 L80 240 Z"
            stroke="black"
            fill={getColor('lowerBack')}
            onClick={(e) => onClickPart('lowerBack',e)}
          />

          <path
            d="M80 240 L120 240 L130 280 L70 280 Z"
            stroke="black"
            fill={getColor('hip')}
            onClick={(e) => onClickPart('hip',e)}
          />

          <rect
            x="40"
            y="130"
            width="15"
            height="160"
            stroke="black"
            fill={getColor('backLeftArm')}
            onClick={(e) => onClickPart('backLeftArm',e)}
          />

          <rect
            x="145"
            y="130"
            width="15"
            height="160"
            stroke="black"
            fill={getColor('backRightArm')}
            onClick={(e) => onClickPart('backRightArm',e)}
          />

          <rect
            x="85"
            y="280"
            width="15"
            height="90"
            stroke="black"
            fill={getColor('backLeftThigh')}
            onClick={(e) => onClickPart('backLeftThigh',e)}
          />

          <rect
            x="100"
            y="280"
            width="15"
            height="90"
            stroke="black"
            fill={getColor('backRightThigh')}
            onClick={(e) => onClickPart('backRightThigh',e)}
          />

          <circle
            cx="92"
            cy="380"
            r="10"
            stroke="black"
            fill={getColor('backLeftKnee')}
            onClick={(e) => onClickPart('backLeftKnee',e)}
          />

          <circle
            cx="107"
            cy="380"
            r="10"
            stroke="black"
            fill={getColor('backRightKnee')}
            onClick={(e) => onClickPart('backRightKnee',e)}
          />

          <rect
            x="85"
            y="390"
            width="15"
            height="80"
            stroke="black"
            fill={getColor('leftCalf')}
            onClick={(e) => onClickPart('leftCalf',e)}
          />

          <rect
            x="100"
            y="390"
            width="15"
            height="80"
            stroke="black"
            fill={getColor('rightCalf')}
            onClick={(e) => onClickPart('rightCalf',e)}
          />

          <ellipse
            cx="92"
            cy="480"
            rx="12"
            ry="8"
            stroke="black"
            fill={getColor('backLeftFoot')}
            onClick={(e) => onClickPart('backLeftFoot',e)}
          />

           
          <ellipse
            cx="107"
            cy="480"
            rx="12"
            ry="8"
            stroke="black"
            fill={getColor('backRightFoot')}
            onClick={(e) => onClickPart('backRightFoot',e)}
          />
        </g>
      
    </g>
  )
}
