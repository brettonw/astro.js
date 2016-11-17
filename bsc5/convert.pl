#! /usr/local/bin/perl

use strict;
use warnings;
no warnings ('substr');

sub appendJson {
    my($key, $val, $comma) = @_;
    chomp $val;
    $val =~ s/^\s+//;
    $val =~ s/\s+$//;
    $val =~ s/(\s)+/$1/;
    return (length ($val) > 0) ? ((($comma > 0) ? ", " : "" ) . "\"$key\":\"$val\"") : "";
}

# gunzip the bsc5.dat file into the "unpacked" directory

print "[\n";
my $lineCount = 0;

my $filename = "unpacked/bsc5.dat";
open(my $fh, "<:encoding(UTF-8)", $filename) or die "Could not open file '$filename' $!";
while (my $entry = <$fh>) {
    chomp $entry;


    # print STDERR "1) $entry\n";

    # insert delimiters... I am only worrying about the fileds up to the magnitude and color...
    $entry = sprintf ("%-200s", $entry);
    # print STDERR "2) $entry\n";
    my @delimeterPositions = (4, 14, 25, 31, 37, 41, 42, 43, 44, 49, 51, 60, 62, 64, 68, 69, 71, 73, 75, 77, 79, 83, 84, 86, 88, 90, 96, 102, 107, 108, 109, 114, 115, 120, 121, 126, 127, 147, 148);
    for (my $i = scalar (@delimeterPositions) - 1; $i >= 0 ; $i--) {
        if (length ($entry) > $delimeterPositions[$i]) {
            # print STDERR "Add Delimeter at $delimeterPositions[$i]\n";
            # $entry = substr $entry, $delimeterPositions[$i], 0, ":";
            substr $entry, $delimeterPositions[$i], 0, ":";
            # print STDERR "2x) $entry\n";
        }
    }
    print STDERR "ENTRY)$entry\n";

    my ($HR, $Name, $DM, $HD, $SAO, $FK5, $IRflag, $r_IRflag, $Multiple, $ADS, $ADScomp, $VarID,
    $RAh1900, $RAm1900, $RAs1900, $DEdash1900, $DEd1900, $DEm1900, $DEs1900,
    $RAh, $RAm, $RAs, $DEdash, $DEd, $DEm, $DEs, $GLON, $GLAT,
    $Vmag, $n_Vmag, $u_Vmag, $BdashV, $u_BdashV, $UdashB, $u_UdashB, $RdashI, $n_RdashI, $SpType, $n_SpType) = split (/:/, $entry);

    if ($lineCount != 0) {
        print ",\n";
    }
    $lineCount++;

    $entry = "{ " .
        appendJson ("HR", $HR, 0) .
        appendJson ("DM", $DM, 1) .
        appendJson ("HD", $HD, 1) .
        appendJson ("SAO", $SAO, 1) .
        appendJson ("FK5", $FK5, 1) .
        appendJson ("Name", $Name, 1) .
        appendJson ("RA", "$RAh" . "h $RAm" . "m $RAs" . "s", 1) .
        appendJson ("DEC", "$DEdash$DEd° $DEm′ $DEs″", 1) .
        appendJson ("Vmag", $Vmag, 1) .
        appendJson ("n_Vmag", $n_Vmag, 1) .
        appendJson ("U-B", $UdashB, 1) .
        appendJson ("B-V", $BdashV, 1) .
        appendJson ("R-I", $RdashI, 1) .
        appendJson ("n_R-I", $n_RdashI, 1) .
        appendJson ("SpType", $SpType, 1) .
        appendJson ("n_SpType", $n_SpType, 1) .
        " }";


    print "$entry";
}

print "\n]";
close $fh;
