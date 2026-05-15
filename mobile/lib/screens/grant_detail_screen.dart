import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/grant.dart';

class GrantDetailScreen extends StatelessWidget {
  final Grant grant;

  const GrantDetailScreen({super.key, required this.grant});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          'Grant Tafsilotlari',
          style: GoogleFonts.outfit(color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              grant.title,
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              grant.organization ?? '',
              style: GoogleFonts.outfit(
                fontSize: 18,
                color: Colors.blueAccent,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 24),
            _buildInfoRow(Icons.public, 'Davlat', grant.country ?? 'Global'),
            _buildInfoRow(
              Icons.school,
              'Daraja',
              grant.degree.isEmpty ? 'Any Degree' : grant.degree.join(', '),
            ),
            _buildInfoRow(
              Icons.category,
              'Soha',
              grant.field.isEmpty ? 'All Fields' : grant.field.join(', '),
            ),
            _buildInfoRow(Icons.attach_money, 'Turi', grant.fundingType ?? 'Noma\'lum'),
            const SizedBox(height: 32),
            Text(
              'Tavsif',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              grant.description ?? 'Ushbu grant haqida qo\'shimcha ma\'lumot berilmagan.',
              style: GoogleFonts.outfit(
                fontSize: 16,
                color: Colors.white70,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: grant.link == null
                    ? null
                    : () {
                        Clipboard.setData(ClipboardData(text: grant.link!));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Havola clipboardga kochirildi.')),
                        );
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  'Batafsil (Veb-saytda)',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 20, color: Colors.blueAccent),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: Colors.white38,
                  ),
                ),
                Text(
                  value,
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
