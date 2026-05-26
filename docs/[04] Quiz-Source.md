## Subject

INSERT INTO Subject (id, name) VALUES
(1, 'java');

## concept

INSERT INTO Concept (id, subject_id, parent_id, title, has_child) VALUES

- - A. Java 기초
    (1, 1, NULL, '자바의 기초', 1),
    (2, 1, 1, 'Java 프로그래밍이란', 0),
    (3, 1, 1, 'Java SE와 Java EE 차이', 1),
    (4, 1, 1, 'Java와 C/C++ 차이', 0),
    (5, 1, 1, 'Java 언어의 장단점', 0),
    (6, 1, 1, '접근 제어자', 1),
    (7, 1, 1, 'Java 데이터 타입', 1),
    (8, 1, 3, 'Java SE', 0),
    (9, 1, 3, 'Java EE', 0),
    (10, 1, 6, 'public', 0),
    (11, 1, 6, 'protected', 0),
    (12, 1, 6, 'default', 0),
    (13, 1, 6, 'private', 0),
    (14, 1, 7, '기본형', 0),
    (15, 1, 7, '참조형', 0),
- - B. 객체지향(OOP)
    (16, 1, NULL, '객체지향(OOP)', 1),
    (17, 1, 16, '객체지향이란', 0),
    (18, 1, 16, '객체와 클래스와 인스턴스', 0),
    (19, 1, 16, '추상화', 0),
    (20, 1, 16, '캡슐화', 0),
    (21, 1, 16, '상속', 0),
    (22, 1, 16, '다형성', 0),
    (23, 1, 16, 'SOLID', 1),
    (24, 1, 23, 'SRP', 0),
    (25, 1, 23, 'OCP', 0),
    (26, 1, 23, 'LSP', 0),
    (27, 1, 23, 'ISP', 0),
    (28, 1, 23, 'DIP', 0),
    (29, 1, 16, '객체지향 vs 절차지향', 0),
    (30, 1, 16, '객체지향 장점과 한계', 0),
- - C. 클래스와 키워드
    (31, 1, NULL, '클래스와 키워드', 1),
    (32, 1, 31, 'static과 non-static', 0),
    (33, 1, 31, 'main 메서드가 static인 이유', 0),
    (34, 1, 31, 'final', 0),
    (35, 1, 31, 'finally', 0),
    (36, 1, 31, 'finalize', 0),
    (37, 1, 31, '실무 요약', 0),
- - D. 타입 심화
    (38, 1, NULL, '타입 심화', 1),
    (39, 1, 38, 'Wrapper Class', 1),
    (40, 1, 39, 'Byte', 0),
    (41, 1, 39, 'Short', 0),
    (42, 1, 39, 'Integer', 0),
    (43, 1, 39, 'Long', 0),
    (44, 1, 39, 'Float', 0),
    (45, 1, 39, 'Double', 0),
    (46, 1, 39, 'Character', 0),
    (47, 1, 39, 'Boolean', 0),
    (48, 1, 38, 'Boxing과 Unboxing', 0),
    (49, 1, 38, 'AutoBoxing과 AutoUnboxing', 0),
    (50, 1, 38, '== 와 equals()', 0),
    (51, 1, 38, 'Call by Value', 0),
- - E. 컬렉션과 문자열
    (52, 1, NULL, '컬렉션과 문자열', 1),
    (53, 1, 52, 'List', 1),
    (54, 1, 53, 'ArrayList', 0),
    (55, 1, 53, 'LinkedList', 0),
    (56, 1, 53, 'Vector', 0),
    (57, 1, 52, 'Set', 1),
    (58, 1, 57, 'HashSet', 0),
    (59, 1, 57, 'LinkedHashSet', 0),
    (60, 1, 57, 'TreeSet', 0),
    (61, 1, 52, 'Map', 1),
    (62, 1, 61, 'HashMap', 0),
    (63, 1, 61, 'LinkedHashMap', 0),
    (64, 1, 61, 'TreeMap', 0),
    (65, 1, 61, 'Hashtable', 0),
    (66, 1, 61, 'ConcurrentHashMap', 0),
    (67, 1, 52, 'String과 StringBuilder와 StringBuffer', 0),
- - F. JVM / 메모리 / GC
    (68, 1, NULL, 'JVM과 메모리와 GC', 1),
    (69, 1, 68, 'JVM 구조', 0),
    (70, 1, 68, 'GC', 0),
    (71, 1, 68, '세대 기반 메모리 관리', 0),
    (72, 1, 68, 'Java 9 기본 GC', 0),
    (73, 1, 68, 'G1GC', 0),
- - G. 현대 Java 기능
    (74, 1, NULL, '현대 Java 기능', 1),
    (75, 1, 74, 'Annotation', 0),
    (76, 1, 74, 'Reflection', 0),
    (77, 1, 74, 'Stream', 0),
    (78, 1, 74, 'Lambda', 0),
    (79, 1, 74, '동기화와 비동기', 0),
- - H. 직렬화
    (80, 1, NULL, '직렬화', 1),
    (81, 1, 80, 'Serialization', 0),
    (82, 1, 80, 'Deserialization', 0),
    (83, 1, 80, 'serialVersionUID', 0),
    (84, 1, 80, '직렬화 실무 주의', 0);

## concept_detail

INSERT INTO Concept_detail (id, concept_id, `key`, value) VALUES

- - A

(1, 2, 'definition', 'Java는 JVM 위에서 동작하는 객체지향 언어이며 한 번 작성하면 여러 환경에서 실행을 목표로 한다.'),
(2, 2, 'specification', 'Java 소스 코드를 컴파일하면 바이트코드(.class)가 생성되고 JVM이 이를 실행한다.'),
(3, 2, 'feature', 'Java의 플랫폼 독립성은 JVM이 제공하고 실행 성능은 JIT 컴파일러가 보완한다.'),

(4, 3, 'comparison', 'Java SE는 기본 표준 플랫폼이고 Java EE는 대규모 서버 애플리케이션용 확장 플랫폼이다.'),

(5, 8, 'definition', 'Java SE는 언어와 기본 라이브러리 중심의 표준 플랫폼이다.'),
(6, 9, 'definition', 'Java EE는 웹과 엔터프라이즈 기능을 포함한 확장 플랫폼이다.'),

(7, 4, 'comparison', 'Java는 JVM 기반 실행과 GC를 사용하고 C/C++는 네이티브 바이너리 기반 실행을 사용한다.'),
(8, 4, 'comparison', 'Java는 이식성과 생산성이 강점이고 C/C++는 저수준 제어와 성능 최적화에 강점이 있다.'),

(9, 5, 'feature', 'Java의 장점은 플랫폼 독립성, 자동 메모리 관리, 풍부한 생태계이다.'),
(10, 5, 'feature', 'Java의 단점은 JVM 계층 오버헤드와 런타임 튜닝 필요성이다.'),

(11, 10, 'definition', 'public은 모든 곳에서 접근 가능한 접근 제어자이다.'),
(12, 11, 'definition', 'protected는 같은 패키지와 상속관계에서 접근 가능한 접근 제어자이다.'),
(13, 12, 'definition', 'default는 같은 패키지에서만 접근 가능한 접근 제어자이다.'),
(14, 13, 'definition', 'private는 같은 클래스 내부에서만 접근 가능한 접근 제어자이다.'),

(15, 14, 'definition', '기본형은 값 자체를 저장하는 데이터 타입이다.'),
(16, 15, 'definition', '참조형은 객체의 참조값을 저장하는 데이터 타입이다.'),

- - B

(17, 17, 'definition', '객체의 상태와 행위를 함께 모델링하고 객체 간 협력으로 프로그램을 설계하는 방식이다.'),
(18, 17, 'feature', '복잡한 시스템을 역할 단위로 분리해 변경 영향도를 낮추는 데 유리하다.'),

(19, 18, 'definition', '클래스는 객체를 만들기 위한 설계도이다.'),
(20, 18, 'definition', '객체는 클래스 기반으로 생성된 실체이다.'),
(21, 18, 'definition', '인스턴스는 특정 클래스 기준에서 생성된 객체를 의미한다.'),

(22, 19, 'definition', '공통 속성과 행위를 추출하여 모델을 단순화하는 객체지향 특징이다.'),
(23, 20, 'definition', '데이터와 로직을 하나로 묶고 외부 접근을 제한하는 객체지향 특징이다.'),
(24, 21, 'definition', '기존 클래스의 기능을 물려받아 새로운 클래스를 확장하는 객체지향 특징이다.'),
(25, 22, 'definition', '같은 인터페이스로 다양한 구현 객체를 다룰 수 있는 객체지향 특징이다.'),

(26, 23, 'definition', '객체지향 설계를 위한 5가지 설계 원칙이다.'),

(27, 24, 'definition', '클래스는 하나의 책임만 가져야 한다는 원칙이다.'),
(28, 25, 'definition', '확장에는 열려 있고 변경에는 닫혀 있어야 한다는 원칙이다.'),
(29, 26, 'definition', '하위 타입은 상위 타입을 대체할 수 있어야 한다는 원칙이다.'),
(30, 27, 'definition', '클라이언트별로 인터페이스를 작게 분리해야 한다는 원칙이다.'),
(31, 28, 'definition', '구현보다 추상에 의존해야 한다는 원칙이다.'),

(32, 29, 'comparison', '절차지향은 처리 순서를 중심으로 설계하고 객체지향은 역할과 책임 중심으로 설계한다.'),

(33, 30, 'feature', '객체지향의 장점은 재사용성, 확장성, 유지보수성 향상이다.'),
(34, 30, 'feature', '과도한 추상화는 시스템 복잡도를 증가시킬 수 있다.'),

- - C

(35, 32, 'comparison', 'static 멤버는 클래스 단위로 공유되고 non-static 멤버는 객체마다 별도로 존재한다.'),

(36, 33, 'definition', 'JVM은 객체 생성 없이 프로그램 시작점을 호출해야 하므로 main 메서드는 static이어야 한다.'),

(37, 34, 'definition', 'final은 변수, 메서드, 클래스의 변경을 제한하는 키워드이다.'),
(38, 34, 'feature', 'final 변수는 재할당이 불가능하다.'),
(39, 34, 'feature', 'final 메서드는 오버라이딩할 수 없다.'),
(40, 34, 'feature', 'final 클래스는 상속할 수 없다.'),

(41, 35, 'definition', 'finally는 예외 발생 여부와 관계없이 항상 실행되는 블록이다.'),

(42, 36, 'definition', 'finalize는 과거 GC 시점에 호출되던 메서드이다.'),

- - D

(43, 39, 'definition', 'Wrapper Class는 기본형 데이터를 객체처럼 다루기 위한 클래스이다.'),

(44, 40, 'definition', 'Byte는 byte 기본형을 객체로 다루기 위한 Wrapper 클래스이다.'),
(45, 41, 'definition', 'Short는 short 기본형을 객체로 다루기 위한 Wrapper 클래스이다.'),
(46, 42, 'definition', 'Integer는 int 기본형을 객체로 다루기 위한 Wrapper 클래스이다.'),
(47, 43, 'definition', 'Long은 long 기본형을 객체로 다루기 위한 Wrapper 클래스이다.'),
(48, 44, 'definition', 'Float는 float 기본형을 객체로 다루기 위한 Wrapper 클래스이다.'),
(49, 45, 'definition', 'Double은 double 기본형을 객체로 다루기 위한 Wrapper 클래스이다.'),
(50, 46, 'definition', 'Character는 char 기본형을 객체로 다루기 위한 Wrapper 클래스이다.'),
(51, 47, 'definition', 'Boolean은 boolean 기본형을 객체로 다루기 위한 Wrapper 클래스이다.'),

(52, 48, 'definition', 'Boxing은 기본형 값을 Wrapper 객체로 변환하는 과정이다.'),
(53, 48, 'definition', 'Unboxing은 Wrapper 객체에서 기본형 값을 꺼내는 과정이다.'),

(54, 49, 'definition', 'AutoBoxing은 컴파일러가 자동으로 기본형을 Wrapper 객체로 변환하는 기능이다.'),
(55, 49, 'definition', 'AutoUnboxing은 Wrapper 객체를 자동으로 기본형으로 변환하는 기능이다.'),

(56, 50, 'comparison', '== 연산자는 기본형에서는 값 비교를 하고 참조형에서는 주소 비교를 수행한다.'),
(57, 50, 'comparison', 'equals 메서드는 객체의 논리적 동등성을 비교한다.'),

(58, 51, 'definition', 'Java는 항상 Call by Value 방식으로 동작한다.'),

- - E

(59, 53, 'definition', 'List는 순서가 있으며 중복 데이터를 허용하는 컬렉션이다.'),

(60, 54, 'feature', 'ArrayList는 인덱스 기반 조회 성능이 우수하다.'),
(61, 55, 'feature', 'LinkedList는 삽입과 삭제 작업에 상대적으로 유리하다.'),
(62, 56, 'feature', 'Vector는 동기화를 지원하는 List 구현체이다.'),

(63, 57, 'definition', 'Set은 중복 데이터를 허용하지 않는 컬렉션이다.'),

(64, 58, 'feature', 'HashSet은 순서를 보장하지 않는다.'),
(65, 59, 'feature', 'LinkedHashSet은 입력 순서를 유지한다.'),
(66, 60, 'feature', 'TreeSet은 데이터를 정렬된 상태로 유지한다.'),

(67, 61, 'definition', 'Map은 key와 value 쌍으로 데이터를 저장하는 컬렉션이다.'),

(68, 62, 'feature', 'HashMap은 순서를 보장하지 않는다.'),
(69, 63, 'feature', 'LinkedHashMap은 삽입 순서를 유지한다.'),
(70, 64, 'feature', 'TreeMap은 key 기준 정렬 상태를 유지한다.'),
(71, 65, 'feature', 'Hashtable은 동기화를 지원하는 레거시 Map 구현체이다.'),
(72, 66, 'feature', 'ConcurrentHashMap은 멀티스레드 환경에서 동시성 성능을 고려한 Map 구현체이다.'),

(73, 67, 'comparison', 'String은 immutable 객체이다.'),
(74, 67, 'comparison', 'StringBuilder는 가변 문자열이며 동기화를 지원하지 않는다.'),
(75, 67, 'comparison', 'StringBuffer는 가변 문자열이며 동기화를 지원한다.'),

- - F

(76, 69, 'definition', 'JVM은 Java 바이트코드를 실행하기 위한 가상 머신이다.'),

(77, 70, 'definition', 'GC는 사용되지 않는 객체를 자동으로 회수하는 메모리 관리 기능이다.'),

(78, 71, 'definition', 'Young 영역은 새롭게 생성된 객체가 저장되는 영역이다.'),
(79, 71, 'definition', 'Old 영역은 오래 살아남은 객체가 이동하는 영역이다.'),

(80, 72, 'definition', 'Java 9부터 기본 GC는 G1GC이다.'),

(81, 73, 'definition', 'G1GC는 힙을 여러 region으로 분할하여 관리하는 GC 방식이다.'),

- - G

(82, 75, 'definition', 'Annotation은 코드에 메타데이터를 부여하는 문법이다.'),

(83, 76, 'definition', 'Reflection은 런타임에 클래스 정보를 조회하고 조작하는 기술이다.'),

(84, 77, 'definition', 'Stream은 데이터를 함수형 파이프라인 방식으로 처리하기 위한 API이다.'),

(85, 78, 'definition', 'Lambda는 메서드를 식 형태로 간결하게 표현하는 문법이다.'),

(86, 79, 'definition', '동기화는 공유 자원 접근을 직렬화하여 데이터 일관성을 보장하는 방식이다.'),
(87, 79, 'definition', '비동기는 작업 완료를 기다리지 않고 다음 작업을 수행하는 방식이다.'),

- - H

(88, 81, 'definition', 'Serialization은 객체 상태를 바이트 스트림으로 변환하는 과정이다.'),
(89, 82, 'definition', 'Deserialization은 바이트 스트림을 객체로 복원하는 과정이다.'),

(90, 83, 'definition', 'serialVersionUID는 직렬화 호환성을 판단하기 위한 식별자이다.'),

(91, 84, 'feature', '신뢰할 수 없는 역직렬화 입력은 보안 취약점이 될 수 있다.'),
(92, 84, 'feature', '민감 정보는 transient 키워드로 직렬화 대상에서 제외할 수 있다.');
