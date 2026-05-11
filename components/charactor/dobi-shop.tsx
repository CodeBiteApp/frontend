import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

// react-native-svg 개별 transform prop deprecated 경고 억제
const AnimatedG = Animated.createAnimatedComponent(G) as React.ComponentType<{
  rotation?: Animated.Value | number;
  originX?: number;
  originY?: number;
  translateX?: Animated.Value | number;
  translateY?: Animated.Value | number;
  children?: React.ReactNode;
}>;

type Props = { width?: number; height?: number };

export default function DobiShop({ width = 400, height = 400 }: Props) {
  const tailAngle = useRef(new Animated.Value(0)).current;
  const eyeX = useRef(new Animated.Value(0)).current;
  const eyeY = useRef(new Animated.Value(0)).current;
  const bottleY = useRef(new Animated.Value(0)).current;
  const acornY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 꼬리 상시 흔들기
    const tailSway = Animated.loop(
      Animated.sequence([
        Animated.timing(tailAngle, {
          toValue: 2,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(tailAngle, {
          toValue: -2,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    // 메인 루프: 물병 들기 → 도토리 들기 반복
    const mainLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1000),

        // 물병 올리기, 눈동자 물병쪽
        Animated.parallel([
          Animated.timing(bottleY, {
            toValue: -22,
            duration: 420,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: false,
          }),
          Animated.timing(eyeX, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(eyeY, {
            toValue: 5,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.delay(900),

        // 물병 내려놓기, 눈동자 복귀
        Animated.parallel([
          Animated.timing(bottleY, {
            toValue: 0,
            duration: 380,
            easing: Easing.in(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(eyeX, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(eyeY, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.delay(1000),

        // 도토리 + 왼팔 올리기, 눈동자 도토리쪽(오른쪽)
        Animated.parallel([
          Animated.timing(acornY, {
            toValue: -28,
            duration: 420,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: false,
          }),
          Animated.timing(eyeX, {
            toValue: 6,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(eyeY, {
            toValue: 4,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.delay(900),

        // 도토리 내려놓기, 눈동자 복귀
        Animated.parallel([
          Animated.timing(acornY, {
            toValue: 0,
            duration: 380,
            easing: Easing.in(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(eyeX, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(eyeY, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      ]),
    );

    tailSway.start();
    mainLoop.start();

    return () => {
      tailSway.stop();
      mainLoop.stop();
    };
  }, [tailAngle, bottleY, acornY, eyeX, eyeY]);

  return (
    <Svg width={width} height={height} viewBox="0 0 400 400" fill="none">
      <Defs>
        <ClipPath id="clip0_628_11">
          <Rect width="400" height="400" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_628_11)">
        <Path
          d="M303.006 163.416H298.335C297.045 163.416 296 164.498 296 165.833V182.746C296 184.081 297.045 185.163 298.335 185.163H303.006C304.297 185.163 305.342 184.081 305.342 182.746V165.833C305.342 164.498 304.297 163.416 303.006 163.416Z"
          fill="white"
        />
        <Path
          d="M314.683 161H312.348C311.058 161 310.012 162.082 310.012 163.416V175.498C310.012 176.832 311.058 177.914 312.348 177.914H314.683C315.974 177.914 317.019 176.832 317.019 175.498V163.416C317.019 162.082 315.974 161 314.683 161Z"
          fill="white"
        />
        <Path
          d="M175 154.753C191.667 110.386 220 98.2865 260 118.453L330 148.703C343.333 155.156 343.333 161.207 330 166.854H243.5C216.833 170.887 191.667 174.92 175 154.753Z"
          fill="#9C847B"
        />
        <Path
          d="M340 169.62C348.837 169.62 356 163.661 356 156.31C356 148.959 348.837 143 340 143C331.163 143 324 148.959 324 156.31C324 163.661 331.163 169.62 340 169.62Z"
          fill="#4F5151"
        />

        {/* 꼬리 - 몸통 연결점(170,292) 기준 좌우 흔들기 */}
        <AnimatedG rotation={tailAngle} originX={170} originY={292}>
          <Path
            d="M170.437 292.317C106.213 334.602 82.8583 250.033 99.567 231.911C176.276 213.789 152.921 153.382 106.213 159.423"
            stroke="#8D6E63"
            strokeWidth={40}
            strokeLinecap="round"
          />
        </AnimatedG>

        {/* 왼팔 - 도토리 들 때 함께 올라감 */}
        <AnimatedG translateY={acornY}>
          <Path
            d="M213 191.719C237.842 220.539 270.432 226.103 309.894 210.662"
            stroke="#9C847B"
            strokeWidth={18}
            strokeLinecap="round"
          />
        </AnimatedG>

        <Path
          d="M203 323.5C233.376 323.5 258 282.87 258 232.75C258 182.63 233.376 142 203 142C172.624 142 148 182.63 148 232.75C148 282.87 172.624 323.5 203 323.5Z"
          fill="#9C847B"
        />
        <Path
          d="M220 317.2C239.33 317.2 255 284.696 255 244.6C255 204.504 239.33 172 220 172C200.67 172 185 204.504 185 244.6C185 284.696 200.67 317.2 220 317.2Z"
          fill="#D0C4C1"
        />
        <Path
          d="M190.995 135.754C198.528 131.254 198.062 115.83 189.956 101.303C181.849 86.7764 169.1 78.6475 161.639 83.1469C154.106 87.6463 154.572 103.07 162.678 117.597C170.785 132.124 183.463 140.253 190.995 135.754Z"
          fill="#8D6E63"
        />
        <Path
          d="M246.477 118.495C255.086 116.8 259.851 102.123 257.12 85.713C254.389 69.303 245.1 57.3738 236.581 59.0686C227.979 60.7633 223.214 75.4401 225.945 91.8502C228.676 108.26 237.869 120.189 246.477 118.495Z"
          fill="#8D6E63"
        />
        <Path
          d="M215 139.35C234.33 139.35 250 123.098 250 103.05C250 83.0021 234.33 66.75 215 66.75C195.67 66.75 180 83.0021 180 103.05C180 123.098 195.67 139.35 215 139.35Z"
          fill="white"
        />
        <Path
          d="M263 123.08C278.464 123.08 291 110.078 291 94.04C291 78.0017 278.464 65 263 65C247.536 65 235 78.0017 235 94.04C235 110.078 247.536 123.08 263 123.08Z"
          fill="white"
        />

        {/* 눈동자 - 물병/도토리 방향으로 부드럽게 이동 */}
        <AnimatedG translateX={eyeX} translateY={eyeY}>
          {/* 오른눈동자 */}
          <Path
            d="M230 130.84C237.732 130.84 244 123.256 244 113.9C244 104.544 237.732 96.96 230 96.96C222.268 96.96 216 104.544 216 113.9C216 123.256 222.268 130.84 230 130.84Z"
            fill="#4F5151"
          />
          {/* 왼눈동자 */}
          <Path
            d="M273 120.62C279.075 120.62 284 114.661 284 107.31C284 99.9591 279.075 94 273 94C266.925 94 262 99.9591 262 107.31C262 114.661 266.925 120.62 273 120.62Z"
            fill="#4F5151"
          />
          {/* 오른 눈동자(흰) */}
          <Path
            d="M225 112.69C227.209 112.69 229 110.523 229 107.85C229 105.177 227.209 103.01 225 103.01C222.791 103.01 221 105.177 221 107.85C221 110.523 222.791 112.69 225 112.69Z"
            fill="white"
          />
          {/* 왼쪽 눈동자(흰) */}
          <Path
            d="M269 106.1C270.657 106.1 272 104.475 272 102.47C272 100.465 270.657 98.84 269 98.84C267.343 98.84 266 100.465 266 102.47C266 104.475 267.343 106.1 269 106.1Z"
            fill="white"
          />
        </AnimatedG>

        {/* 단안경 부분 */}
        <Path
          d="M201.944 134C191.759 148.452 192.778 159.118 205 166"
          stroke="#D32F2F"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Path
          d="M255.521 122.474C249.888 117.99 246.251 118.95 244.61 125.355"
          stroke="#D32F2F"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* 모자부분 */}
        <Path
          d="M150.932 83.1678C150.013 81.3225 155.435 47.9938 141.782 9.50779C186.568 21.2326 208.904 16.8221 243.236 48.9841C243.236 48.9841 151.851 85.0132 150.932 83.1678Z"
          fill="#7B1FA2"
        />
        <Path
          d="M217.6 37L219 40.5H223.2L219.7 43.3L221.1 47.5L217.6 44.7L214.1 47.5L215.5 43.3L212 40.5H216.2L217.6 37Z"
          fill="#FDD835"
        />
        <Path
          d="M169.984 20.5394L178.43 29.0465L192.263 23.247L184.203 35.0596L192.649 43.5667L178.575 41.0334L170.516 52.846L170.37 40.8591L156.296 38.3258L170.129 32.5263L169.984 20.5394Z"
          fill="#FDD835"
        />
        <Path
          d="M166.589 60.3632L167.789 63.3632H171.389L168.389 65.7632L169.589 69.3632L166.589 66.9632L163.589 69.3632L164.789 65.7632L161.789 63.3632H165.389L166.589 60.3632Z"
          fill="#FDD835"
        />

        {/* 오른 팔 - 독립 idle bob */}
        {/* 오른 팔 - 물병 들 때 함께 올라감 */}
        <AnimatedG translateY={bottleY}>
          <Path
            d="M235 206C220.039 222.164 199.843 225.013 175 216"
            stroke="#9C847B"
            strokeWidth={20}
            strokeLinecap="round"
          />
        </AnimatedG>

        {/* 물병 전체 그룹 - 올라갔다 내려오는 애니메이션 */}
        <AnimatedG translateY={bottleY}>
          <Path
            d="M251.5 218.3C259.826 218.3 266.575 216.8 266.575 214.95C266.575 213.1 259.826 211.6 251.5 211.6C243.174 211.6 236.425 213.1 236.425 214.95C236.425 216.8 243.174 218.3 251.5 218.3Z"
            fill="#E0E0E0"
          />
          <Path
            d="M246.475 173.075H256.525L254.85 164.7H248.15L246.475 173.075Z"
            fill="#8D6E63"
          />
          <Path
            d="M248.15 164.7H254.85L254.18 166.375H248.82L248.15 164.7Z"
            fill="#795548"
          />
          <Path
            d="M256.86 173.075H246.14C245.4 173.075 244.8 173.675 244.8 174.415V175.085C244.8 175.825 245.4 176.425 246.14 176.425H256.86C257.6 176.425 258.2 175.825 258.2 175.085V174.415C258.2 173.675 257.6 173.075 256.86 173.075Z"
            fill="#B2EBF2"
            stroke="#80DEEA"
            strokeWidth={2}
          />
          <Path
            opacity={0.6}
            d="M256.525 176.425H246.475V186.475H256.525V176.425Z"
            fill="#E0F7FA"
          />
          <Path
            d="M236.157 191.5C237.463 194.482 239.61 197.019 242.335 198.8C245.06 200.582 248.244 201.53 251.5 201.53C254.755 201.53 257.94 200.582 260.665 198.8C263.39 197.019 265.537 194.482 266.843 191.5H236.157Z"
            fill="#00E5FF"
          />
          <Path
            d="M251.5 194.85C259.974 194.85 266.843 193.35 266.843 191.5C266.843 189.65 259.974 188.15 251.5 188.15C243.026 188.15 236.157 189.65 236.157 191.5C236.157 193.35 243.026 194.85 251.5 194.85Z"
            fill="#84FFFF"
          />
          <Path
            opacity={0.7}
            d="M248.15 205.235C249.26 205.235 250.16 204.335 250.16 203.225C250.16 202.115 249.26 201.215 248.15 201.215C247.04 201.215 246.14 202.115 246.14 203.225C246.14 204.335 247.04 205.235 248.15 205.235Z"
            fill="white"
          />
          <Path
            opacity={0.7}
            d="M256.525 207.915C257.265 207.915 257.865 207.315 257.865 206.575C257.865 205.835 257.265 205.235 256.525 205.235C255.785 205.235 255.185 205.835 255.185 206.575C255.185 207.315 255.785 207.915 256.525 207.915Z"
            fill="white"
          />
          <Path
            opacity={0.7}
            d="M254.18 198.2C255.105 198.2 255.855 197.45 255.855 196.525C255.855 195.6 255.105 194.85 254.18 194.85C253.255 194.85 252.505 195.6 252.505 196.525C252.505 197.45 253.255 198.2 254.18 198.2Z"
            fill="white"
          />
          <Path
            opacity={0.7}
            d="M243.125 197.53C243.68 197.53 244.13 197.08 244.13 196.525C244.13 195.97 243.68 195.52 243.125 195.52C242.57 195.52 242.12 195.97 242.12 196.525C242.12 197.08 242.57 197.53 243.125 197.53Z"
            fill="white"
          />
          <Path
            opacity={0.7}
            d="M259.875 200.545C260.245 200.545 260.545 200.245 260.545 199.875C260.545 199.505 260.245 199.205 259.875 199.205C259.505 199.205 259.205 199.505 259.205 199.875C259.205 200.245 259.505 200.545 259.875 200.545Z"
            fill="white"
          />
          <Path
            d="M251.5 214.95C260.751 214.95 268.25 207.451 268.25 198.2C268.25 188.949 260.751 181.45 251.5 181.45C242.249 181.45 234.75 188.949 234.75 198.2C234.75 207.451 242.249 214.95 251.5 214.95Z"
            stroke="#80DEEA"
            strokeWidth={4}
          />
          <Path
            opacity={0.3}
            d="M251.5 214.28C260.381 214.28 267.58 207.081 267.58 198.2C267.58 189.319 260.381 182.12 251.5 182.12C242.619 182.12 235.42 189.319 235.42 198.2C235.42 207.081 242.619 214.28 251.5 214.28Z"
            fill="#E0F7FA"
          />
          <Path
            opacity={0.9}
            d="M238.1 191.5C238.58 189.718 239.423 188.054 240.576 186.613C241.729 185.172 243.167 183.984 244.8 183.125"
            stroke="white"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            opacity={0.6}
            d="M238.1 196.525C237.897 198.743 238.251 200.977 239.128 203.024C240.005 205.071 241.379 206.867 243.125 208.25"
            stroke="white"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path
            d="M246.475 179.775C249.825 182.008 253.175 182.008 256.525 179.775"
            stroke="#A1887F"
            strokeWidth={2}
          />
          <Path
            d="M256.525 179.775L266.575 184.8L264.23 188.82L254.18 183.795L256.525 179.775Z"
            fill="#FFE0B2"
            stroke="#D7CCC8"
          />
          <Path
            d="M256.86 182.623C257.322 182.623 257.697 182.248 257.697 181.785C257.697 181.322 257.322 180.948 256.86 180.948C256.397 180.948 256.022 181.322 256.022 181.785C256.022 182.248 256.397 182.623 256.86 182.623Z"
            fill="#5D4037"
          />
          <Path
            d="M258.87 185.135L261.55 187.145ZM261.55 185.135L258.87 187.145Z"
            fill="black"
          />
          <Path
            d="M258.87 185.135L261.55 187.145M261.55 185.135L258.87 187.145"
            stroke="#E65100"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </AnimatedG>

        <Path
          d="M203.779 76.14C237.328 63.0868 263.174 49.0341 261.508 44.7525C259.842 40.4709 231.295 47.5817 197.746 60.635C164.197 73.6882 138.35 87.7409 140.016 92.0225C141.682 96.3041 170.23 89.1932 203.779 76.14Z"
          fill="#6A1B9A"
        />
        <Path
          d="M222.5 141C234.926 141 245 133.389 245 124C245 114.611 234.926 107 222.5 107C210.074 107 200 114.611 200 124C200 133.389 210.074 141 222.5 141Z"
          stroke="#D32F2F"
          strokeWidth={5}
        />

        {/* 책상 */}
        <Rect x="43" y="243" width="314" height="120" rx="5" fill="#71584F" />

        {/* 도토리 - 왼팔과 함께 올라감 */}
        <AnimatedG translateY={acornY}>
          <Path
            d="M302.058 201.683C301.302 215.827 307.001 227.164 318.002 227.752C329.004 228.339 335.878 217.674 336.633 203.529L302.058 201.683Z"
            fill="#C29F6F"
          />
          <Path
            d="M321.065 182.209L319.808 182.142C318.766 182.086 317.877 182.885 317.821 183.927L317.183 195.871C317.128 196.913 317.927 197.802 318.969 197.858L320.226 197.925C321.267 197.98 322.157 197.181 322.213 196.14L322.851 184.195C322.906 183.154 322.107 182.264 321.065 182.209Z"
            fill="#5B3E25"
          />
          <Path
            d="M335.251 193.999L304.447 192.354C300.802 192.159 297.689 194.956 297.494 198.602C297.299 202.247 300.097 205.361 303.742 205.555L334.546 207.2C338.191 207.395 341.304 204.598 341.499 200.952C341.694 197.307 338.896 194.194 335.251 193.999Z"
            fill="#5B3E25"
          />
        </AnimatedG>
      </G>
    </Svg>
  );
}
