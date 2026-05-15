class Grant {
  final String id;
  final String title;
  final String? organization;
  final String? country;
  final List<String> degree;
  final String? fundingType;
  final double? trustScore;
  final String? deadline;
  final List<String> field;
  final double? minGPA;
  final double? minIELTS;
  final int? matchPercent;
  final String? description;
  final String? link;

  Grant({
    required this.id,
    required this.title,
    this.organization,
    this.country,
    this.degree = const [],
    this.fundingType,
    this.trustScore,
    this.deadline,
    this.field = const [],
    this.minGPA,
    this.minIELTS,
    this.matchPercent,
    this.description,
    this.link,
  });

  factory Grant.fromJson(Map<String, dynamic> json) {
    List<String> stringList(dynamic value) {
      if (value == null) return const [];
      if (value is List) {
        return value.map((item) => item.toString()).toList();
      }
      return [value.toString()];
    }

    double? asDouble(dynamic value) {
      if (value == null) return null;
      if (value is num) return value.toDouble();
      return double.tryParse(value.toString());
    }

    int? asInt(dynamic value) {
      if (value == null) return null;
      if (value is num) return value.round();
      return int.tryParse(value.toString());
    }

    return Grant(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      organization: json['organization'],
      country: json['country'],
      degree: stringList(json['degree']),
      fundingType: json['type'] ?? json['fundingType'],
      trustScore: asDouble(json['trustScore']),
      deadline: json['deadline'],
      field: stringList(json['field']),
      minGPA: asDouble(json['minGPA']),
      minIELTS: asDouble(json['minIELTS']),
      matchPercent: asInt(json['matchPercent']),
      description: json['description'],
      link: json['sourceUrl'] ?? json['link'],
    );
  }
}
