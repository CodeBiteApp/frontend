import api from "@/api/axios";
import { deleteSecureStore, saveSecureStore } from "./secureStore";
import { clearTokenRefreshTimer, scheduleTokenRefresh } from "./tokenRefresh";

// 실제 모듈을 로드하지 않고 팩토리 함수로 대체
jest.mock("@/api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock("./secureStore", () => ({
  saveSecureStore: jest.fn(),
  deleteSecureStore: jest.fn(),
}));

describe("tokenRefresh", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearTokenRefreshTimer();
    jest.useRealTimers();
  });

  it("25분 후 refresh API를 호출한다", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { accessToken: "new-token" },
    });

    scheduleTokenRefresh();

    await jest.advanceTimersByTimeAsync(25 * 60 * 1000);

    expect(api.post).toHaveBeenCalledWith("/api/auth/refresh");
  });

  it("갱신 성공 시 토큰을 저장하고 다시 예약한다", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { accessToken: "new-token" },
    });

    scheduleTokenRefresh();
    await jest.advanceTimersByTimeAsync(25 * 60 * 1000);

    expect(saveSecureStore).toHaveBeenCalledWith("accessToken", "new-token");
    // 재예약 확인: 타이머가 다시 걸려있는지
    expect(jest.getTimerCount()).toBe(1);
  });

  it("갱신 실패 시 토큰을 삭제한다", async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error("401"));

    scheduleTokenRefresh();
    await jest.advanceTimersByTimeAsync(25 * 60 * 1000);

    expect(deleteSecureStore).toHaveBeenCalledWith("accessToken");
  });

  it("clearTokenRefreshTimer 호출 시 타이머가 취소된다", () => {
    scheduleTokenRefresh();
    expect(jest.getTimerCount()).toBe(1);

    clearTokenRefreshTimer();
    expect(jest.getTimerCount()).toBe(0);
  });
});
